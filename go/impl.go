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

// MakeSession Create and return a new session object
func MakeSession(endpoint, token string, logger *logrus.Logger) *Session {
	s := Session{endpoint: endpoint, token: token, log: logger}
	s.accounts = make(map[int]Account)
	s.subaccounts = make(map[int]SubAccount)

	return &s
}

func (s *Session) connectSession() error {
	var err error
	cookieJar, _ := cookiejar.New(nil)

	s.client = &http.Client{
		Jar: cookieJar,
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
	if accessibleTenants, ok := s.user["accessibleTenants"].([]interface{}); ok {
		for _, at := range accessibleTenants {
			if a, ok := at.(map[string]interface{}); ok {
				var acc Account
				if x, ok := a["id"].(float64); ok {
					acc.ID = int(x)
					s.defaultAccountID = acc.ID
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
				if x, ok := sa["tenantId"].(float64); ok {
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

func (s *Session) setAccountByName(name string) (Account, error) {
	for _, a := range s.accounts {
		if strings.EqualFold(a.Name, name) {
			s.defaultAccountID = a.ID
			return a, nil
		}
	}
	return Account{}, errors.New("Account was not found")
}

func (s *Session) setSubAccountByName(name string) (SubAccount, error) {
	for _, sa := range s.subaccounts {
		if strings.EqualFold(sa.Name, name) {
			s.defaultSubAccountID = sa.ID
			return sa, nil
		}
	}
	return SubAccount{}, errors.New("Subaccount was not found")
}

func (s *Session) getActiveSubAccount() (SubAccount, error) {
	if s.defaultSubAccountID != -1 {
		return s.subaccounts[s.defaultSubAccountID], nil
	}
	return SubAccount{}, errors.New("A default sub account has not been set")
}

func (s *Session) get(path string) ([]byte, error) {
	s.log.WithField("request", string(s.endpoint+path)).Info("avayacloud: get request")

	req, err := http.NewRequest("GET", s.endpoint+path, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", s.token)
	resp, err := s.client.Do(req)
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

	req, err := http.NewRequest("DELETE", s.endpoint+path, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", s.token)
	resp, err := s.client.Do(req)
	if err != nil {
		return []byte{}, err
	}
	defer resp.Body.Close()
	body, _ := ioutil.ReadAll(resp.Body)

	switch resp.StatusCode {
	case http.StatusOK, http.StatusNoContent:
		return body, nil
	}
	return body, fmt.Errorf("Error deleting %d on %s", resp.StatusCode, s.endpoint+path)
}

func (s *Session) postForm(path string, values url.Values) ([]byte, error) {
	s.log.WithField("request", string(s.endpoint+path)).Info("avayacloud: post request")

	req, err := http.NewRequest("POST", s.endpoint+path, strings.NewReader(values.Encode()))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", s.token)
	resp, err := s.client.Do(req)
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

	body, err := s.postRaw(path, "application/json", json)

	return body, err
}

func (s *Session) postRaw(path, contentType string, data []byte) ([]byte, error) {
	req, err := http.NewRequest("POST", s.endpoint+path, bytes.NewReader(data))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", s.token)
	req.Header.Set("Content-Type", contentType)
	resp, err := s.client.Do(req)
	if err != nil {
		return []byte{}, err
	}
	defer resp.Body.Close()
	body, _ := ioutil.ReadAll(resp.Body)

	switch resp.StatusCode {
	case http.StatusOK, http.StatusNoContent:
		return body, nil
	}
	s.log.WithFields(logrus.Fields{
		"status":   resp.StatusCode,
		"url":      s.endpoint + path,
		"response": prettyError(body),
	}).Debug("Error on POST")

	err = fmt.Errorf("Error %d on %s. Response is: %s", resp.StatusCode, s.endpoint+path, prettyError(body))

	return body, err
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
