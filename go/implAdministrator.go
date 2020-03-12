package avayacloud

import (
	"encoding/json"
	"fmt"
	"strings"

	"github.com/pkg/errors"
)

const customerAdminRoleNumber = 4

func (s *Session) getAdministrator(username string) (Administrator, error) {
	sa, err := s.getActiveSubAccount()
	if err != nil {
		return Administrator{}, err
	}
	path := fmt.Sprintf("/spokenAbc/ac/users?tenantId=%d&clientId=%d", s.defaultAccountID, sa.ID)
	body, err := s.get(path)
	if err != nil {
		return Administrator{}, errors.WithMessage(err, "doing getAdministrator()")
	}
	admins := []Administrator{}
	err = json.Unmarshal(body, &admins)
	if err != nil {
		return Administrator{}, errors.WithMessage(err, "doing unmarshal in getAdministrator()")
	}
	for _, rv := range admins {
		if strings.EqualFold(rv.Username, username) {
			if rv.Disabled {
				return Administrator{}, errors.New("Administrator is in the deleted state")
			}
			return rv, nil
		}
	}
	return Administrator{}, errors.WithMessage(err, "not found")
}

func (s *Session) createAdministrator(username, password, firstName, lastName, email string) (Administrator, error) {
	sa, err := s.getActiveSubAccount()
	if err != nil {
		return Administrator{}, err
	}
	type createAdministratorRequest struct {
		StartDate           string `json:"startDate"`
		EndDate             string `json:"endDate"`
		Username            string `json:"username"`
		Password            string `json:"password"`
		ExtID               string `json:"extId"`
		FirstName           string `json:"firstName"`
		LastName            string `json:"lastName"`
		MaxSessionsAllowed  int    `json:"maxSessionsAllowed"`
		ClientID            int    `json:"clientId"`
		AccessibleClientIDs []int  `json:"accessibleClientIds"`
		AccessibleTenantIDs []int  `json:"accessibleTenantIds"`
		Email               string `json:"email"`
		RoleIDs             []int  `json:"roleIds"`
	}
	car := createAdministratorRequest{
		StartDate: "2019-03-21",
		EndDate:   "2038-01-01",
		Username:  username,
		Password:  password,
		// ExiID
		FirstName:           firstName,
		LastName:            lastName,
		MaxSessionsAllowed:  100,
		ClientID:            sa.ID,
		AccessibleClientIDs: []int{}, // Will apply to all current and future subaccounts
		AccessibleTenantIDs: []int{s.defaultAccountID},
		Email:               email,
		RoleIDs:             []int{customerAdminRoleNumber},
	}
	_, err = s.postJSON("/spokenAbc/ac/users", car)
	if err != nil {
		return Administrator{}, err
	}
	entity, err := s.waitFor(func() (interface{}, error) { a, err := s.getAdministrator(username); return a, err }, waitRetries, waitInterval, true)
	if err != nil {
		return Administrator{}, errors.WithMessage(err, "Create Administrator never completed")
	}
	return entity.(Administrator), err
}

func (s *Session) deleteAdministrator(username string) error {
	admin, err := s.getAdministrator(username)
	if err != nil {
		return errors.New("Administrator does not exist to delete")
	}
	path := fmt.Sprintf("/spokenAbc/ac/users/%d", admin.ID)
	_, err = s.delete(path)
	if err != nil {
		return err
	}
	_, err = s.waitFor(func() (interface{}, error) { _, err := s.GetAdministrator(username); return nil, err }, waitRetries, waitInterval, false)
	return err
}
