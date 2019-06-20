/*
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

package avayacloud_test

import (
	"flag"
	"os"
	"testing"
	"time"

	"github.com/sirupsen/logrus"
	avayacloud "github.com/spokencloud/avaya-cloud-api/go"
)

var (
	username *string
	password *string
	endpoint *string
	debug    *bool
)

func TestMain(m *testing.M) {
	username = flag.String("u", "", "Username for API calls")
	password = flag.String("p", "", "Password for API calls")
	endpoint = flag.String("e", "https://login.bpo.avaya.com", "Endpoint for API calls")
	debug = flag.Bool("d", false, "Enable debugging")

	os.Exit(m.Run())
}

func TestCreateAndDeleteAgent(t *testing.T) {
	log := logrus.New()

	if *username == "" || *password == "" {
		t.Fatal("Both username and password must be specified")
	}
	testUsername := "Bob" + time.Now().Format("0102150405")
	log.WithField("agent name", testUsername).Debug("Creating a session")

	session := avayacloud.NewSession(*endpoint, *username, *password)
	if *debug {
		log.SetLevel(logrus.DebugLevel)
		session.SetLogger(log)
	}
	err := session.Open()
	if err != nil {
		t.Fatal("Got error creating session:", err)
	}
	log.Debug("Doing CreateAgent() but expecting failure because test account has multiple sub accounts")

	agent, err := session.CreateAgent(testUsername, "mypassword", "Bob", "Test Agent", "bobo@avaya.com")
	if err == nil {
		t.Fatal("Unexpected create test agent:", err)
		return
	}
	err = session.SetSubAccount("AnotherTestCorp")
	if err != nil {
		t.Fatal("Unexpected failure setting sub account:", err)
		return
	}
	log.Debug("Doing DeleteAgent() might fail -- just to make sure future create passes")
	session.DeleteAgent(testUsername)

	log.Debug("Doing CreateAgent() expecting pass")

	agent, err = session.CreateAgent(testUsername, "my!passWord7", "Bob", "Test Agent", "bobo@avaya.com")
	if err != nil {
		t.Fatal("Failure during create test agent:", err)
		return
	}
	{
		h := session.GetAgents()
		agents, _ := h.GetMoreAgents()
		for _, a := range agents {
			log.WithField("name", a.Username).Debug("Got Agent")
		}
	}
	log.Debug("Doing DeleteAgent() expecting pass")

	err = session.DeleteAgent(agent.Username)
	if err != nil {
		t.Fatal("Failed to delete test agent:", err)
	}
	{
		h := session.GetAgents()
		agents, _ := h.GetMoreAgents()
		for _, a := range agents {
			log.WithField("name", a.Username).Debug("Got Agent")
		}
	}
	log.Debug("Complete: pass")
}
