package avayacloud

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"sort"
	"strconv"
	"strings"

	"github.com/pkg/errors"
	"github.com/sirupsen/logrus"
)

type agentsHandle struct {
	s        *Session
	position int
}

type stationType struct {
	ID                  int    `json:"id"`
	Name                string `json:"name"`
	Extension           string `json:"extension"`
	SecurityCode        string `json:"securityCode"`
	ClientID            int    `json:"clientId"`
	AgentStationGroupID int    `json:"agentStationGroupId"`
	Username            string `json:"username"`
}

func (s *Session) generateExtension(subAccountID int, extensionType string) (string, error) {
	url := s.endpoint + "/spokenAbc/extensions/next/" + strconv.Itoa(subAccountID) + "/type/" + extensionType
	resp, err := s.client.Post(url, "text/plain", nil)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()
	body, _ := ioutil.ReadAll(resp.Body)

	if resp.StatusCode != http.StatusOK {
		s.log.WithFields(logrus.Fields{
			"status":        resp.StatusCode,
			"extensionType": extensionType,
			"response":      prettyError(body),
		}).Error("Error on generating an extension")

		err = fmt.Errorf("Error %d on generating an extension for an %s. Response is: %s", resp.StatusCode, extensionType, prettyError(body))
	}
	return string(body), nil
}

func (s *Session) getAgentStationGroupID(subAccountID int) (int, error) {
	body, err := s.get("/spokenAbc/agentStationGroups/client/" + strconv.Itoa(subAccountID))
	type agentStationGroup struct {
		ID     int    `json:"id"`
		Name   string `json:"name"`
		Active bool   `json:"active"`
	}
	asg := []agentStationGroup{}
	err = json.Unmarshal(body, &asg)
	if err != nil {
		return 0, err
	}
	if len(asg) == 0 {
		return 0, errors.New("There are no agent station groups -- expected at least one")
	}
	sort.Slice(asg[:], func(i, j int) bool {
		return asg[i].ID < asg[j].ID
	})
	return asg[0].ID, nil
}

func (s *Session) getSkillIDs(subAccountID int, skillType string) ([]int, error) {
	body, err := s.get("/spokenAbc/skills/multiClientSkills?clientIds=" + strconv.Itoa(subAccountID) + "&skillType=AGENT")

	type skill struct {
		ID        int    `json:"id"`
		Name      string `json:"name"`
		Number    int    `json:"number"`
		Extension string `json:"extension"`
		SkillType string `json:"skillType"`
	}
	type skillResponse struct {
		SkillResponses map[string][]skill `json:"skillResponses"`
	}
	sr := skillResponse{}
	err = json.Unmarshal(body, &sr)
	if err != nil {
		return []int{0}, err
	}
	skillList, exists := sr.SkillResponses[strconv.Itoa(subAccountID)]
	if !exists {
		return []int{0}, errors.New("Getting Skills: The sub account didn't respond")
	}
	if len(skillList) == 0 {
		return []int{0}, errors.New("There are no skills -- expected at least one")
	}
	rv := make([]int, 0, len(skillList))

	for _, v := range skillList {
		if strings.EqualFold(skillType, v.SkillType) {
			rv = append(rv, v.ID)
		}
	}
	return rv, nil
}

func (s *Session) getAgent(username string) (Agent, error) {
	body, err := s.get("/spokenAbc/agents/username/" + username)
	if err != nil {
		return Agent{}, errors.WithMessage(err, "doing getAgent()")
	}
	rv := Agent{}
	err = json.Unmarshal(body, &rv)
	if err != nil {
		return Agent{}, errors.WithMessage(err, "doing unmarshal in getAgent()")
	}
	return rv, err
}

func (s *Session) getAgents() *Handle {
	return &Handle{internalHandle: &agentsHandle{s: s}}
}

func (h *agentsHandle) getMoreAgents() ([]Agent, error) {
	body, err := h.s.get("/spokenAbc/agents?clientId=" + strconv.Itoa(h.s.defaultSubAccountID))
	if err != nil {
		return []Agent{}, errors.WithMessage(err, "doing getMoreAgents()")
	}
	rv := []Agent{}
	err = json.Unmarshal(body, &rv)
	if err != nil {
		return []Agent{}, errors.WithMessage(err, "doing unmarshal in getMoreAgents()")
	}
	if h.position == len(rv) {
		return []Agent{}, nil
	}
	h.position += len(rv)

	if h.position > len(rv) {
		return []Agent{}, errors.New("Call to getMoreAgents() when you are past the end")
	}
	return rv, err
}

func (s *Session) getStation(subAccountID int, username string) (stationType, error) {
	body, err := s.get("/spokenAbc/stations?clientId=" + strconv.Itoa(subAccountID))
	if err != nil {
		return stationType{}, errors.WithMessage(err, "doing getStation()")
	}
	stations := []stationType{}
	err = json.Unmarshal(body, &stations)
	if err != nil {
		return stationType{}, errors.WithMessage(err, "doing unmarshal in getStation()")
	}
	for _, s := range stations {
		if s.Username == username {
			return s, nil
		}
	}
	return stationType{}, errors.New("Station not found")
}

func (s *Session) createStation(agentStationGroupID, subAccountID int, stationExtension, agentUsername string) (stationType, error) {
	station := stationType{
		AgentStationGroupID: agentStationGroupID,
		ClientID:            subAccountID,
		Extension:           stationExtension,
		Name:                stationName,
		SecurityCode:        generateSecurityCode(stationExtension),
		Username:            agentUsername,
	}
	_, err := s.postJSON("/spokenAbc/jobs/stations", station)
	if err != nil {
		return stationType{}, err
	}
	newStation, err := s.waitFor(func() (interface{}, error) { x, err := s.getStation(subAccountID, agentUsername); return x, err }, waitRetries, waitInterval, true)
	if err != nil {
		return stationType{}, err
	}
	return newStation.(stationType), err
}

func (s *Session) deleteStation(subAccountID int, username string) error {
	station, err := s.getStation(subAccountID, username)
	if err != nil {
		return err
	}
	_, err = s.delete("/spokenAbc/jobs/stations/" + strconv.Itoa(station.ID))
	if err != nil {
		return err
	}
	_, err = s.waitFor(func() (interface{}, error) { _, err := s.getStation(subAccountID, username); return nil, err }, waitRetries, waitInterval, false)
	return err
}

func (s *Session) createAgent(username, password, firstName, lastName, email string) (Agent, error) {
	sa, err := s.getActiveSubAccount()
	if err != nil {
		return Agent{}, err
	}
	agentStationGroupID, err := s.getAgentStationGroupID(sa.ID)
	if err != nil {
		return Agent{}, err
	}
	agentLoginID, err := s.generateExtension(sa.ID, "AGENT")
	if err != nil {
		return Agent{}, err
	}
	skills, err := s.getSkillIDs(sa.ID, "AGENT")
	if err != nil {
		return Agent{}, err
	}

	type createAgentRequest struct {
		Username            string `json:"username"`
		FirstName           string `json:"firstName"`
		LastName            string `json:"lastName"`
		Password            string `json:"password"`
		Email               string `json:"email"`
		LoginID             string `json:"loginId"`
		AgentStationGroupID int    `json:"agentStationGroupId"`
		SecurityCode        string `json:"securityCode"`
		StartDate           string `json:"startDate"`
		EndDate             string `json:"endDate"`
		AvayaPassword       string `json:"avayaPassword"`
		ClientID            int    `json:"clientId"`
		SkillIDs            []int  `json:"skillIds"`
		SupervisorID        int    `json:"supervisorId"`
		ChannelIDs          []int  `json:"channelIds"`
	}
	car := createAgentRequest{
		Username:            username,
		Password:            password,
		FirstName:           firstName,
		LastName:            lastName,
		Email:               email,
		LoginID:             agentLoginID,
		AgentStationGroupID: agentStationGroupID,
		ClientID:            sa.ID,
		SecurityCode:        generateSecurityCode(agentLoginID),
		AvayaPassword:       generateAvayaPassword(agentLoginID),
		StartDate:           "2019-03-21",
		EndDate:             "2038-01-01",
		// no supervisors
		SupervisorID: 0,
		// channel 1 is voice
		ChannelIDs: []int{1},
		SkillIDs:   skills,
	}
	_, err = s.postJSON("/spokenAbc/jobs/agents", car)
	if err != nil {
		return Agent{}, err
	}
	entity, err := s.waitFor(func() (interface{}, error) { a, err := s.getAgent(username); return a, err }, waitRetries, waitInterval, true)
	if err != nil {
		return Agent{}, errors.WithMessage(err, "Create Agent never completed")
	}
	stationExtension, err := s.generateExtension(sa.ID, "STATION")
	if err != nil {
		return Agent{}, err
	}
	_, err = s.createStation(agentStationGroupID, sa.ID, stationExtension, username)
	if err != nil {
		return Agent{}, err
	}
	return entity.(Agent), err
}

func (s *Session) deleteAgent(username string) error {
	agent, err := s.getAgent(username)
	if err != nil {
		return errors.New("Agent does not exist to delete")
	}
	s.deleteStation(agent.ClientID, agent.Username)
	//
	// Delete the agent.
	//
	type deleteAgentRequest struct {
		Username string `json:"username"`
		LoginID  string `json:"loginId"`
	}
	_, err = s.postJSON("/spokenAbc/agents/removeAgent", deleteAgentRequest{Username: username, LoginID: agent.LoginID})
	if err != nil {
		return err
	}
	_, err = s.waitFor(func() (interface{}, error) { _, err := s.getAgent(username); return nil, err }, waitRetries, waitInterval, false)
	return err
}
