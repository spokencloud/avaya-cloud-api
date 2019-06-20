package avayacloud

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/http/cookiejar"
	"net/url"
	"strings"
	"time"

	"github.com/pkg/errors"
	"github.com/sirupsen/logrus"
)

const (
	waitRetries  = 5
	waitInterval = time.Second * 10
	stationName  = "generated station"
)

func generateAvayaPassword(seed string) string {
	return seed[len(seed)-6:]
}

func generateSecurityCode(seed string) string {
	return seed[len(seed)-4:]
}

func prettyError(text []byte) string {
	/*
		if json.Valid(text) {
			var out bytes.Buffer
			out.WriteString("\n")
			json.Indent(&out, text, "", "    ")
			return out.String()
		}
	*/
	return string(text)
}

func (s *Session) connectSession() error {
	cookieJar, _ := cookiejar.New(nil)

	s.client = &http.Client{
		Jar: cookieJar,
	}
	err := s.goLogin()
	if err != nil {
		s.log.WithError(err).Error("avayacloud: login method failed")
		return err
	}
	questions, err := s.createQuestionRequest()
	if err != nil {
		s.log.WithError(err).Error("avayacloud: question request failed")
		return err
	}
	err = s.createQuestionAnswerRequest(questions)
	if err != nil {
		s.log.WithError(err).Error("avayacloud: question answers failed")
		return err
	}
	s.user, err = s.getUser()
	if err != nil {
		s.log.WithError(err).Error("avayacloud: get user")
		return err
	}
	if id, ok := s.user["userId"].(float64); ok {
		s.userID = int(id)
	} else {
		s.log.WithError(err).Error("avayacloud: userId is missing")
	}
	if id, ok := s.user["firstName"].(string); ok {
		s.firstName = id
	}
	if id, ok := s.user["lastName"].(string); ok {
		s.lastName = id
	}
	if id, ok := s.user["email"].(string); ok {
		s.email = id
	}
	s.accounts = make(map[int]Account)

	if accessibleTenants, ok := s.user["accessibleTenants"].([]interface{}); ok {
		for _, at := range accessibleTenants {
			if a, ok := at.(map[string]interface{}); ok {
				var acc Account
				if x, ok := a["id"].(float64); ok {
					acc.ID = int(x)
				} else {
					continue
				}
				if x, ok := a["name"].(string); ok {
					acc.Name = x
				}
				if x, ok := a["code"].(string); ok {
					acc.Code = x
				}
				if x, ok := a["accountSize"].(string); ok {
					acc.AccountSize = x
				}
				s.accounts[acc.ID] = acc
			}
		}
	}
	s.subaccounts = make(map[int]SubAccount)

	if accessibleClients, ok := s.user["accessibleClients"].([]interface{}); ok {
		for _, ac := range accessibleClients {
			if sa, ok := ac.(map[string]interface{}); ok {
				var sub SubAccount
				if x, ok := sa["id"].(float64); ok {
					sub.ID = int(x)
					s.defaultSubAccountID = sub.ID
				} else {
					continue
				}
				if x, ok := sa["name"].(string); ok {
					sub.Name = x
				}
				if x, ok := sa["code"].(string); ok {
					sub.Code = x
				}
				if x, ok := sa["accountSize"].(string); ok {
					sub.AccountSize = x
				}
				if x, ok := sa["tennantId"].(float64); ok {
					sub.AccountID = int(x)
				}
				if x, ok := sa["appId"].(string); ok {
					sub.AppID = x
				}
				if x, ok := sa["regions"].([]string); ok {
					sub.Regions = x
				}
				s.subaccounts[sub.ID] = sub
			}
		}
	}
	if len(s.subaccounts) != 1 {
		s.defaultSubAccountID = -1
	}
	s.log.WithFields(logrus.Fields{
		"userID":      s.userID,
		"firstName":   s.firstName,
		"lastName":    s.lastName,
		"email":       s.email,
		"accounts":    len(s.accounts),
		"subaccounts": len(s.subaccounts),
	}).Info("avayacloud: session has been setup")

	return nil
}

func (s *Session) setSubAccountByName(name string) error {
	for _, sa := range s.subaccounts {
		if strings.EqualFold(sa.Name, name) {
			s.defaultSubAccountID = sa.ID
			return nil
		}
	}
	return errors.New("Subaccount was not found")
}

func (s *Session) getActiveSubAccount() (SubAccount, error) {
	if s.defaultSubAccountID != -1 {
		return s.subaccounts[s.defaultSubAccountID], nil
	}
	return SubAccount{}, errors.New("A default sub account has not been set")
}

func (s *Session) get(path string) ([]byte, error) {
	s.log.WithField("request", string(s.endpoint+path)).Info("avayacloud: get request")

	resp, err := s.client.Get(s.endpoint + path)
	if err != nil {
		return []byte{}, err
	}
	defer resp.Body.Close()
	body, _ := ioutil.ReadAll(resp.Body)

	if resp.StatusCode != http.StatusOK {
		s.log.WithFields(logrus.Fields{
			"status":   resp.StatusCode,
			"url":      s.endpoint + path,
			"response": prettyError(body),
		}).Debug("Error on GET")

		err = fmt.Errorf("Error %d on %s. Response is: %s", resp.StatusCode, s.endpoint+path, prettyError(body))
	}
	return body, err
}

func (s *Session) delete(path string) ([]byte, error) {
	s.log.WithField("request", string(s.endpoint+path)).Info("avayacloud: delete request")

	req, err := http.NewRequest("DELETE", path, nil)
	if err != nil {
		return nil, err
	}
	resp, err := s.client.Do(req)
	if err != nil {
		return []byte{}, err
	}
	defer resp.Body.Close()
	body, _ := ioutil.ReadAll(resp.Body)

	if resp.StatusCode != http.StatusOK {
		err = fmt.Errorf("Error deleting %d on %s", resp.StatusCode, s.endpoint+path)
	}
	return body, err
}

func (s *Session) postForm(path string, values url.Values) ([]byte, error) {
	s.log.WithField("request", string(s.endpoint+path)).Info("avayacloud: post request")

	resp, err := s.client.PostForm(s.endpoint+path, values)
	if err != nil {
		return []byte{}, err
	}
	defer resp.Body.Close()
	body, _ := ioutil.ReadAll(resp.Body)

	if resp.StatusCode != http.StatusOK {
		s.log.WithFields(logrus.Fields{
			"status":   resp.StatusCode,
			"url":      s.endpoint + path,
			"response": prettyError(body),
		}).Debug("Error on POST Form")

		err = fmt.Errorf("Error %d on %s. Response is: %s", resp.StatusCode, s.endpoint+path, prettyError(body))
	}
	return body, err
}

func (s *Session) postJSON(path string, data interface{}) ([]byte, error) {
	json, _ := json.Marshal(data)

	s.log.WithField("request", string(s.endpoint+path)).WithField("json", string(json)).Info("avayacloud: post JSON request")

	resp, err := s.client.Post(s.endpoint+path, "application/json", bytes.NewReader(json))
	if err != nil {
		return []byte{}, err
	}
	defer resp.Body.Close()
	body, _ := ioutil.ReadAll(resp.Body)

	if resp.StatusCode != http.StatusOK {
		s.log.WithFields(logrus.Fields{
			"status":   resp.StatusCode,
			"url":      s.endpoint + path,
			"response": prettyError(body),
		}).Debug("Error on POST JSON")

		err = fmt.Errorf("Error %d on %s. Response is: %s", resp.StatusCode, s.endpoint+path, prettyError(body))
	}
	return body, err
}

func (s *Session) goLogin() error {
	body, err := s.postForm("/login", url.Values{"username": {s.username}, "password": {s.password}})
	if err != nil {
		s.log.WithField("response", string(body)).Info("avayacloud: response text")
	}
	return err
}

func (s *Session) createQuestionRequest() ([]string, error) {
	body, err := s.get("/question/answer")
	if err != nil {
		s.log.WithField("response", string(body)).Info("avayacloud: response text")
		return nil, errors.WithMessage(err, "doing /question/answer")
	}
	//
	// Find "questions" key.
	// Example response: {"userId":3749009,"questions":[
	//	                  "What is your youngest child's nickname?",
	//                    "What is the first name of your spouse’s father?",
	//					  "What is your maternal grandmother’s middle name?"]}
	//
	rv := make([]string, 0)
	data := make(map[string]interface{})
	err = json.Unmarshal(body, &data)
	if err != nil {
		s.log.WithField("bad_json_body", string(body)).Error("bad json body")
		return nil, errors.WithMessage(err, "doing /question/answer unmarshal")
	}
	if q, exists := data["questions"]; exists {
		iv, ok := q.([]interface{})
		if !ok {
			return nil, errors.New("questions was wrong type")
		}
		for _, v := range iv {
			q, ok := v.(string)
			if !ok {
				return nil, errors.New("question was wrong type")
			}
			rv = append(rv, q)
		}
		return rv, nil
	}
	return nil, errors.New("questions did not exist in /question/answer")
}

func getAnswer(rawQuestion string) string {
	words := strings.Split(rawQuestion, " ")
	answer := strings.Trim(words[len(words)-1], "?")
	return answer
}

func (s *Session) createQuestionAnswerRequest(questions []string) error {
	type qaPair struct {
		Q string `json:"question"`
		A string `json:"answer"`
	}

	type ar struct {
		Username string   `json:"username"`
		Qap      []qaPair `json:"questionAnswerPairs"`
	}

	answers := make([]qaPair, 0, len(questions))
	for _, q := range questions {
		answers = append(answers, qaPair{Q: q, A: getAnswer(q)})
	}
	if len(questions) < 3 {
		return fmt.Errorf("At least three questions were expected")
	}
	answerResponse := ar{Username: s.username, Qap: answers}

	body, err := s.postJSON("/user/question/answer", answerResponse)

	s.log.WithField("response", string(body)).Info("avayacloud: response text")

	return err
}

func (s *Session) getUser() (map[string]interface{}, error) {
	body, err := s.get("/user")
	if err != nil {
		return nil, errors.WithMessage(err, "doing getUser()")
	}
	rv := make(map[string]interface{})
	err = json.Unmarshal(body, &rv)
	if err != nil {
		return nil, errors.WithMessage(err, "doing unmarshal in getUser()")
	}
	return rv, err
}

func (s *Session) waitFor(method func() (interface{}, error), tries int, interval time.Duration, waitForPass bool) (interface{}, error) {
	for i := 0; i < tries; i++ {
		entity, err := method()
		if err == nil && waitForPass {
			return entity, nil
		}
		if err != nil && !waitForPass {
			return entity, nil
		}
		time.Sleep(interval)
	}
	return nil, errors.New("waiting for completion timed out")
}
