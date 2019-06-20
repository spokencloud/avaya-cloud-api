package avayacloud

import (
	"io/ioutil"
	"net/http"
	"time"

	"github.com/sirupsen/logrus"
)

// Account An Avaya Cloud Account
type Account struct {
	ID          int
	Name        string
	Code        string
	AccountSize string
}

// Agent An Avaya Cloud Agent
type Agent struct {
	Username            string `json:"username"`
	Firstname           string `json:"firstName"`
	Lastname            string `json:"lastName"`
	Password            string
	AvayaPassword       string       `json:"avayaPassword"`
	LoginID             string       `json:"loginId"`
	ClientID            int          `json:"clientId"` // Subaccount ID
	AgentStationGroupID int          `json:"agentStationGroupId"`
	SvcPhone            string       `json:"svcPhone"`
	SvcPhonePrefix      string       `json:"svcPhonePrefix"`
	SecurityCode        string       `json:"securityCode"`
	StartDate           time.Time    `json:"startDate"`
	EndDate             time.Time    `json:"endDate"`
	Enabled             bool         `json:"enabled"`
	Supervisor          bool         `json:"supervisor"`
	Skills              []Skill      `json:"skills"`
	AgentSkills         []AgentSkill `json:"agentSkills"`
	SupervisorID        interface{}  `json:"supervisorId"`
	AutoAnswer          interface{}  `json:"autoAnswer"`
	//	ChannelIDs          []int // channel 1 is voice
}

// AgentSkill An Avaya Cloud Skill
type AgentSkill struct {
}

// Handle A handle used for returning long results
type Handle struct {
	// There are no visible contents here
	internalHandle interface{}
}

// Session An Avaya Cloud Session
type Session struct {
	log                 *logrus.Logger
	endpoint            string
	username            string
	password            string
	client              *http.Client
	firstName           string
	lastName            string
	email               string
	userID              int
	user                map[string]interface{}
	accounts            map[int]Account
	subaccounts         map[int]SubAccount
	defaultSubAccountID int
}

// Skill An Avaya Cloud Skill
type Skill struct {
}

// SubAccount An Avaya Cloud SubAccount
type SubAccount struct {
	ID          int
	Name        string
	Code        string
	AccountSize string
	AccountID   int
	AppID       string
	Regions     []string
}

//
// The Subscription type describes an Avaya Cloud data subscription. A subscription is scoped to the
// sub account identified in the session.
//
type Subscription struct {
	// The ID of this subscription. Leave blank for new subscriptions.
	ID string

	// The name of the data source for the subscription. Valid values are:
	//   ECH, HAGLOG, HAGENT, RT_AGENT_STATE, RT_DID_STATE, RT_SKILL_STATE, RT_VDN_STATE
	//
	// A subscription is for exactly one data source. You can create multiple subscriptions for
	// multiple data sources.
	DataSource string

	// The start time of the subscription. When created, the data will be sent starting from
	// StartTime. If StartTime is zero, data is sent from "The Beginning of Time". The beginning
	// of time for the real-time tables is the current time minus 24 hours.
	StartTime time.Time

	// The frequency of how often data is sent. If the value is zero (default) data is sent as
	// quickly as possible.  Other values (ex: 10-mintues) try to batch data for up to Frequency units.
	// Data can always come faster if buffers on the producer side fill up. The guarantee is that
	// the producer will be flushed at least every Frequency units.
	//
	// The data producer can modify the frequency to match the frequency of the data source. When
	// you do a get on a subscription this value will be set to the anticipated actual frequency.
	//
	Frequency time.Duration

	// The maximum size (in bytes) of a POST request that the endpoint can accept. The producer will
	// always flush before exceeding this number of bytes. The default (0) is unlimited.
	MaximumPostSize int

	// Format for encoding the data.  Valid values are "CSV" and "JSON". If unspecified, the format
	// is CSV.
	//
	// CSV data is compatible with RFC-4180 and always contains a header line before the data. The
	// header allows the consumer to adapt to changing data formats over time. CSV data is sent with an
	// text/csv content-type. CSV data is encoded in UTF-8.
	//
	// JSON data is encoded according to http://json.org.  Each line in the request data consists of
	// a single JSON object so a consumer should decode each line individually (see: http://jsonlines.org/).
	// JSON data is sent with an application/x-json-stream content-type. JSON data is encoded in UTF-8.
	//
	// The same data is delivered for any data format.
	//
	Format string

	// The endpoint where data will be sent. Data is sent via an HTTP 1.1 POST request in the format described
	// by the Format parameter. The specified protocol must be http or https. If a port is specified it will
	// be used instead of the default port for the protocol.
	//
	// Multiple subscriptions may share the same endpoint. Any given POST request to the endpoint will contain
	// data for exactly one subscription (no mixing).
	//
	// If you do share endpoints you must disambiguate the data in the request on the endpoint side.  Since this
	// might be a challenge using a URL query string or path parameters to disambiguate could be an option.
	//
	Endpoint string

	// If set, any TLS certificates will not be verified when connecting to the endpoint. This is necessary
	// if the endpoint has a self-signed certificate or doesn't not require verification for some other reason.
	//
	DisableTLSVerify bool

	// If set, the producer will use the indicated BasicAuth username and password to connect to the
	// endpoint. BasicAuth will only be used if the protocol is https.
	BasicAuthUsername string
	BasicAuthPassword string

	// This read-only field, when non zero, gives the oldest time where we dropped data due a failure to
	// send data to an endpoint. There is no information on why the transmission failed or how long
	// the outage lasted.
	//
	// As a consumer you can only know that some data may have been lost at or after this time. The two
	// decisions a consumer can make are to ignore this or modify the subscription to start at or before
	// this time. In the latter case, any missing data will be resent.
	//
	// Whenever a subscription is updated, this field is reset to zero.
	//
	OldestError time.Time

	// This read-only field, indicates the number of POST requests that have been lost since OldestError.
	// A POST request is lost when it is dropped because the internal retry-limit has been exceeded (see
	// `RetryPolicy`). This count is reset whenever the subscription is updated.
	//
	LostPostRequests int

	// This read-only field, indicates the number of records that have been lost since OldestError.
	// A record is lost when its POST request is dropped because the internal retry-limit has been exceeded
	// (see `RetryPolicy`). This count is reset whenever the subscription is updated.
	//
	LostRecords int

	// This read-only field, when non zero, gives the time data was last sent to the endpoint.
	LastData time.Time

	// Errors happen as a normal course of events. When a transmission error occurs, the producer uses an
	// exponential backoff policy and retries several times after which it sets OldestError and drops the
	// data being sent.
	//
	// If unspecified, the policy is DEFAULT
	//
	// You can change this policy with these settings:
	//   DEFAULT: Use the default exponential backoff policy.
	//   DROP: Drop data on the first error and set OldestError without any retries.
	//
	RetryPolicy string
}

//
// Sessions
//

// NewSession Create a new station for communicating with the Avaya Cloud
func NewSession(endpoint, username, password string) *Session {
	discardLogger := logrus.New()
	discardLogger.Out = ioutil.Discard
	s := Session{endpoint: endpoint, username: username, password: password, log: discardLogger}

	return &s
}

// SetLogger Set's a logger to use for this package. If you don't manually set this, there
// will be no logging.
func (s *Session) SetLogger(l *logrus.Logger) {
	s.log = l
}

// Open Connect the session
func (s *Session) Open() error {
	return s.connectSession()
}

// SetSubAccount Most of the API's use an implied sub account taken from the session. If there is a
// single subaccount accessable by the logged in user that subaccount is the one used.
// If there are multiple subaccounts you can call this method and set the subaccount to use.
func (s *Session) SetSubAccount(name string) error {
	return s.setSubAccountByName(name)
}

//
// Agents
//

// CreateAgent Creates a new agent in ABC
func (s *Session) CreateAgent(username, password, firstName, lastName, email string) (Agent, error) {
	agent, err := s.createAgent(username, password, firstName, lastName, email)
	return agent, err
}

// DeleteAgent Deletes an agent in ABC
func (s *Session) DeleteAgent(username string) error {
	return s.deleteAgent(username)
}

// GetAgent Gets an agent by username
func (s *Session) GetAgent(username string) (Agent, error) {
	agent, err := s.getAgent(username)
	return agent, err
}

// GetAgents returns the set of agents handled by a sub account. Because this list can be long,
// this is a two-part API. The first method, GetAgents(), retruns an opaque handle that
// you pass to GetMoreAgents until you have the complete set of agents.
func (s *Session) GetAgents() *Handle {
	return s.getAgents()
}

// GetMoreAgents returns one or more agents remaining in the set of agents represented by Handle.
// When you get to the end of the list, the agent array returned will be empty and
// you should stop calling GetMoreAgents.
func (h *Handle) GetMoreAgents() ([]Agent, error) {
	ah := h.internalHandle.(*agentsHandle)
	a, err := ah.getMoreAgents()
	return a, err
}

//
// Accounts
//

// CreateAccount Creates a new account in ABC
func (s *Session) CreateAccount() (*Account, error) {
	account, err := s.createAccount()
	return account, err
}

// DeleteAccount Deletes an account in ABC
func (s *Session) DeleteAccount(id string) error {
	return s.deleteAccount(id)
}

// GetAccount Gets an account by id
func (s *Session) GetAccount(id string) (*Account, error) {
	account, err := s.getAccount(id)
	return account, err
}

// GetAccounts returns the set of accounts handled by the current credential. Because this list can be long,
// this is a two-part API. The first method, GetAccounts(), retruns an opaque handle that
// you pass to GetMoreAccounts until you have the complete set of accounts.
func (s *Session) GetAccounts() (Handle, error) {
	return s.getAccounts()
}

// GetMoreAccounts returns one or more accounts remaining in the set of accounts represented by Handle.
// When you get to the end of the list, the account array returned will be empty and
// you should stop calling GetMoreAccounts.
func (s *Session) GetMoreAccounts(h *Handle) ([]Account, error) {
	ah := h.internalHandle.(*accountsHandle)
	a, err := ah.getMoreAccounts()
	return a, err
}

//
// Access to data
//

// Subscribe to a data feed
//
// The Subscribe() method creates or updates an existing subscription to an Avaya Cloud
// data feed. See the description of Subscription for details on the parameters. If no
// ID parameter is specified, then a new subscription is created. Otherwise the indicated
// subscription is updated.
//
func (s *Session) Subscribe(sub *Subscription) (*Subscription, error) {
	rv, err := s.subscribe(sub)
	return rv, err
}

// GetSubscription returns a subscription struct given a subscription id
//
// This function is often used to check for errors on data sent to a subscription endpoint.
//
func (s *Session) GetSubscription(id string) (*Subscription, error) {
	rv, err := s.getSubscription(id)
	return rv, err
}

// DeleteSubscription removes a data feed
//
// The data feed with the specified id is removed from the system. No more data will be sent to
// the specified endpoint.
//
func (s *Session) DeleteSubscription(id string) error {
	return s.deleteSubscription(id)
}

// GetSubscriptions returns the set of subscription objects registered for this account
//
func (s *Session) GetSubscriptions() ([]Subscription, error) {
	rv, err := s.getSubscriptions()
	return rv, err
}
