package avayacloud

type accountsHandle struct {
	s        *Session
	position int
}

func (s *Session) createAccount() (*Account, error) {
	// TODO: Implement
	return &Account{}, nil
}

func (s *Session) getAccount(id string) (*Account, error) {
	// TODO: Implement
	return &Account{}, nil
}

func (s *Session) deleteAccount(id string) error {
	// TODO: Implement
	return nil
}

func (s *Session) getAccounts() (Handle, error) {
	// TODO: Implement
	return Handle{}, nil
}

func (h *accountsHandle) getMoreAccounts() ([]Account, error) {
	// TODO: Implement
	return []Account{}, nil
}
