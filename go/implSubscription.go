package avayacloud

func (s *Session) subscribe(sub *Subscription) (*Subscription, error) {
	return &Subscription{}, nil
}

func (s *Session) getSubscription(id string) (*Subscription, error) {
	return &Subscription{}, nil
}

func (s *Session) deleteSubscription(id string) error {
	return nil
}

func (s *Session) getSubscriptions() ([]Subscription, error) {
	return []Subscription{}, nil
}
