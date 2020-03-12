/*
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

package avayacloud_test

import (
	"flag"
	"fmt"
	"os"
	"strings"
	"testing"
	"time"

	"github.com/sirupsen/logrus"
	avayacloud "github.com/spokencloud/avaya-cloud-api/go"
)

var (
	token    *string
	endpoint *string
	debug    *bool
	session1 *avayacloud.Session
	session2 *avayacloud.Session
	log      = logrus.New()
)

func TestMain(m *testing.M) {
	token = flag.String("t", "", "Token for API calls")
	endpoint = flag.String("e", "https://login.bpo.avaya.com", "Endpoint for API calls")
	debug = flag.Bool("d", false, "Enable debugging")

	os.Exit(m.Run())
}

func setupSessions(t *testing.T) {
	if session1 != nil && session2 != nil {
		return
	}
	session1 = avayacloud.NewSession(*endpoint, *token)
	if *debug {
		log.SetLevel(logrus.DebugLevel)
		session1.SetLogger(log)
	}
	err := session1.Open()
	if err != nil {
		t.Fatal("Got error creating session:", err)
	}

	session2 = avayacloud.NewSession(*endpoint, *token)
	if *debug {
		log.SetLevel(logrus.DebugLevel)
		session2.SetLogger(log)
	}
	err = session2.Open()
	if err != nil {
		t.Fatal("Got error creating session:", err)
	}
}

func TestAccounts_a_invalidAccounts(t *testing.T) {
	setupSessions(t)

	if *token == "" {
		t.Fatal("Token must be specified")
	}
	accountID := 9999999999

	log.Debug("Doing GetAccount() but expecting failure because test account doesn't exist")

	_, err := session1.GetAccount(accountID)
	if err == nil {
		t.Fatal("Unexpected get account success:", err)
	}
	log.Debug("Complete: pass")
}

func TestAccounts_b_CreatingAccounts(t *testing.T) {
	setupSessions(t)

	if *token == "" {
		t.Fatal("Token must be specified")
	}
	magicNumber := time.Now().Format("0102150405")
	testAccountName := "SDKTestAccount" + magicNumber

	account, err := session1.CreateAccount(testAccountName, "")
	if err != nil {
		t.Fatal("Failure during create account:", err)
	}
	_, err = session1.GetAccount(account.ID)
	if err != nil {
		t.Fatal("Test account does not exist after creation:", err)
	}
	//TODO: FIXME
	//FIXME: TODO
	log.Info("Sleeping TWO MINUTES to avoid a bug with account deletion after create")
	time.Sleep(time.Minute * 2)

	log.Debug("Doing DeleteAccount() expecting pass")

	err = session1.DeleteAccount(account.ID)
	if err != nil {
		t.Fatal("Failed to delete test account:", err)
	}
	//TODO: FIXME
	//FIXME: TODO
	log.Info("Sleeping TWO MINUTES to avoid a bug with account deletion after create")
	time.Sleep(time.Minute * 2)

	acct, err := session1.GetAccount(account.ID)
	if err == nil {
		t.Fatal("Test account exists after deletion:", fmt.Sprintf("account: %+v, acct: %+v", account, acct))
	}
	log.Debug("Complete: pass")
}

func TestCreateWithInvalidSkill(t *testing.T) {
	setupSessions(t)

	if *token == "" {
		t.Fatal("Token must be specified")
	}
	testUsername := "Bob" + time.Now().Format("0102150405")

	log.Debug("Doing CreateAgent() but expecting failure because bad skill")

	_, err := session2.SetSubAccount("AnotherTestCorp")
	if err != nil {
		t.Fatal("Unexpected failure setting sub account:", err)
	}
	_, err = session2.CreateAgent(testUsername, "my!passWord7", "Bob", "Test Agent", "bobo@avaya.com", []string{"junk"})
	if err == nil {
		t.Fatal("Unexpected create test agent success:", err)
	}
	log.WithError(err).Debug("error from CreateAgent with bad skill")
	session2.DeleteAgent(testUsername)

	log.Debug("TestCreateWithInvalidSkill pass")
}

func TestCreateAndDeleteAdministrator(t *testing.T) {
	setupSessions(t)

	if *token == "" {
		t.Fatal("Token must be specified")
	}
	magicNumber := time.Now().Format("0102150405")

	testUsername := "BobA" + magicNumber

	sa, err := session2.SetSubAccount("AnotherTestCorp")
	if err != nil {
		t.Fatal("Unexpected failure setting sub account:", err)
	}
	log.WithField("subAccount", sa).Debug("Setting subAccount")
	log.Debug("Doing DeleteAdministrator() might fail -- just to make sure future create passes:", testUsername)
	session2.DeleteAdministrator(testUsername)

	log.Debug("Doing CreateAdministrator() expecting pass:", testUsername)

	admin, err := session2.CreateAdministrator(
		testUsername, "my!passWord7",
		"Bob", "Test Admin",
		"bobA"+magicNumber+"@avaya.com")

	if err != nil {
		t.Fatal("Failure during create test admin:", err)
	}
	{
		_, err := session2.GetAdministrator(testUsername)
		if err != nil {
			t.Fatal("Failure validating create test admin:", err)
		}
	}
	if !strings.EqualFold(admin.Username, testUsername) {
		t.Fatal("Expecting username to match after admin creation")
	}
	if admin.Enabled == false {
		t.Fatal("new administrator is not enabled")
	}
	if admin.Admin == false {
		t.Fatal("new administrator is not an admin")
	}
	log.Debug("Doing DeleteAdministrator() expecting pass:", testUsername)

	err = session2.DeleteAdministrator(testUsername)
	if err != nil {
		t.Fatal("Failed to delete test admin:", err)
	}
	{
		//TODO: FIXME
		//FIXME: TODO
		log.Info("Sleeping TWO MINUTES to avoid a bug with account deletion after create")
		time.Sleep(time.Minute * 2)

		a, err := session2.GetAdministrator(testUsername)
		if err == nil {
			t.Fatal("Failure validating delete test admin:", fmt.Sprintf("%+v", a))
		}
	}
	log.Debug("Complete: pass")
}

func TestCreateAndDeleteAgent(t *testing.T) {
	setupSessions(t)

	if *token == "" {
		t.Fatal("Token must be specified")
	}
	testUsername := "Bob" + time.Now().Format("0102150405")

	log.Debug("Doing CreateAgent() but expecting failure because test account has multiple sub accounts")

	agent, err := session2.CreateAgent(testUsername, "mypassword", "Bob", "Test Agent", "bobo@avaya.com", []string{"Customerservice"})
	if err == nil {
		t.Fatal("Unexpected create test agent:", err)
	}
	sa, err := session2.SetSubAccount("AnotherTestCorp")
	if err != nil {
		t.Fatal("Unexpected failure setting sub account:", err)
	}
	log.WithField("subAccount", sa).Debug("Setting subAccount")
	log.Debug("Doing DeleteAgent() might fail -- just to make sure future create passes")
	session2.DeleteAgent(testUsername)

	log.Debug("Doing CreateAgent() expecting pass")

	agent, err = session2.CreateAgent(testUsername, "my!passWord7", "Bob", "Test Agent", "bobo@avaya.com", []string{"Customerservice"})
	if err != nil {
		t.Fatal("Failure during create test agent:", err)
	}
	{
		h := session2.GetAgents()
		agents, _ := h.GetMoreAgents()
		for _, a := range agents {
			log.WithField("name", a.Username).Debug("Got Agent")
		}
	}
	log.Debug("Doing DeleteAgent() expecting pass")

	err = session2.DeleteAgent(agent.Username)
	if err != nil {
		t.Fatal("Failed to delete test agent:", err)
	}
	{
		h := session2.GetAgents()
		agents, _ := h.GetMoreAgents()
		for _, a := range agents {
			log.WithField("name", a.Username).Debug("Got Agent")
		}
	}
	log.Debug("Complete: pass")
}
