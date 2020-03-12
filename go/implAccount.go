package avayacloud

import (
	"encoding/json"
	"strconv"

	"github.com/pkg/errors"
)

type accountsHandle struct {
	s        *Session
	position int
}

func (s *Session) createAccount(name, timeZone string) (Account, error) {
	car := Account{
		Name:            name,
		DefaultTimeZone: timeZone,
		AccountSize:     "MEDIUM",
		Active:          true,
		SubAccounts: []SubAccount{
			{
				Name:        name + "_sub", //TODO remove _sub
				AccountSize: "MEDIUM",
				Active:      true,
			},
		},
		RegionIDs: []int{1},
	}
	body, err := s.postJSON("/spokenAbc/ac/tenants", car)
	if err != nil {
		return Account{}, err
	}
	s.log.WithField("body", string(body)).Info("DEBUG: createAccount response body")
	rv := Account{}
	err = json.Unmarshal(body, &rv)
	if err != nil {
		return Account{}, errors.WithMessage(err, "doing unmarshal in createAccount()")
	}
	//
	// Wait on subaccount creation to complete.
	//
	rvInterface, err := s.waitFor(func() (interface{}, error) {
		a, err := s.GetAccount(rv.ID)
		if err != nil {
			return a, err
		}
		if len(a.SubAccounts) == 0 {
			return a, errors.New("Waiting for sub accounts")
		}
		return a, err
	}, waitRetries, waitInterval, true)
	if err != nil {
		return Account{}, errors.WithMessage(err, "Create Account never completed")
	}
	rv = rvInterface.(Account)
	//
	// For creating default skills and station groups, we need to open a session to the new account.
	//
	{
		newSa := NewSession(s.endpoint, s.token)
		err := newSa.Open()
		if err != nil {
			s.log.WithError(err).Error("Got error creating sub-session")
			return Account{}, errors.WithMessage(err, "Creating session for new account")
		}
		//
		// Create default skill
		//
		err = newSa.CreateSkill(DefaultSkill)
		if err != nil {
			s.log.WithError(err).Error("Skill creation failed for default skill")
		}
		//
		// Create default station group.
		//
		type groupType struct {
			Name              string `json:"name"`
			StationTemplateID int    `json:"stationTemplateId"`
			ClientID          int    `json:"clientId"`
		}
		group := groupType{
			ClientID:          rv.SubAccounts[0].ID,
			Name:              DefaultStationGroup,
			StationTemplateID: 4,
		}
		_, err = newSa.postJSON("/spokenAbc/agentStationGroups", group)
		if err != nil {
			s.log.WithError(err).Error("agentStationGroup creation failed for default station group")
			return Account{}, errors.WithMessage(err, "Creating default agent station group")
		}
	}
	return rv, err
}

func (s *Session) getAccount(id int) (Account, error) {
	body, err := s.get("/spokenAbc/ac/tenants/" + strconv.Itoa(id))
	if err != nil {
		return Account{}, errors.WithMessage(err, "doing getAccount()")
	}
	s.log.WithField("body", string(body)).Info("DEBUG: getAccount response body")
	rv := Account{}
	err = json.Unmarshal(body, &rv)
	if err != nil {
		return Account{}, errors.WithMessage(err, "doing unmarshal in getAccount()")
	}
	return rv, err
}

func (s *Session) getSubAccount(appid string) (SubAccount, error) {
	body, err := s.get("/spokenAbc/ac/clients/v2/" + appid)
	if err != nil {
		return SubAccount{}, errors.WithMessage(err, "doing getSubAccount()")
	}
	s.log.WithField("body", string(body)).Info("DEBUG: getSubAccount response body")
	rv := SubAccount{}
	err = json.Unmarshal(body, &rv)
	if err != nil {
		return SubAccount{}, errors.WithMessage(err, "doing unmarshal in getSubAccount()")
	}
	return rv, err
}

func (s *Session) deleteAccount(id int) error {
	_, err := s.delete("/spokenAbc/ac/tenants/" + strconv.Itoa(id))
	if err != nil {
		return err
	}
	// Delete is async but don't bother waiting.
	//_, err = s.waitFor(func() (interface{}, error) { _, err := s.getAccount(id); return nil, err }, waitRetries, waitInterval, false)
	return err
}

func (s *Session) getAccounts() (Handle, error) {
	// TODO: Implement
	return Handle{}, nil
}

func (h *accountsHandle) getMoreAccounts() ([]Account, error) {
	// TODO: Implement
	return []Account{}, nil
}
