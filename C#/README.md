# The C# API for the Avaya Public Cloud

## Prerequisites 
 1.Net Framework 4.7.2+ (Windows Environment) <br />
 2.msbuild.exe (comes with Visual studio or Visual studio build tools) <br />
 3.Packages need to be installed (can be installed using nuget package manager) <br />
        a.Microsoft.AspNet.WebApi.Client v5.2.7+ <br />
	    b.Newtonsoft.Json v12.0.2+		<br />
		c.CommandLineParser.2.5.0       <br />


## Build the whole solution 
using below command from cmd (This will create executables for each of the entities in respective folders. sln file in under avayacloud-client-common folder)
cd \<path to avayacloud-client.sln\> <br />
<Path to msbuild.exe> avayacloud-client.sln /t:Clean,Build /p:Configuration=Release

## Build the specific project 
Using below commands from cmd (This will create executables for specifc entity.)
cd \<path to avayacloud-client-agent.proj\> <br />
<Path to msbuild.exe> avayacloud-client-agent.proj /t:Clean,Build /p:Configuration=Release

## Run the sample client for the entity
### For Agent
avayacloud-client-agent.exe --endpoint \<Avayacloud endpoint\> --abcusername \<Avaya Cloud username\> --abcpassword \<Avaya Cloud password\> --agent_username \<Agent username\> --agent_password \<Agent password\>  --firstname \<First Name of Agent\> --lastname \<Last Name of Agent\> --startdate \<Start Date for Agent\> --enddate \<End Date  for Agent\>
#### Notes
First Name, Last Name, Start Date, End Date are optional arguments.
### For Subscription
avayacloud-client-subscription.exe --endpoint \<Avayacloud endpoint\> --abcusername \<Avaya Cloud username\> --abcpassword \<Avaya Cloud password\> --subscriptionEndPoint \<endpoint\> --dataDeliveryFormat \<delivery format(CSV/JSON)\> --dataSourceType \<ECH/HAGENT/HAGLOG..\> --startTime \<Subscription start time\> --frequencyInMinutes \<frequency of data post in mins\> --subAccountAppId  \<SubAccountAppId for which the subscription data to be fecthed\>
#### Notes
subAccountAppId is an optional argument. It can be used to pass a specific subAccountAppId or 'ALL' if user is a sysadmin to get data of all subaccounts. If nothing is passed one of the subaccounts assigned to the user will be used. 
Avaya cloud endpoint URL e.g https://integration.bpo.avaya.com/, https://login.bpo.avaya.com/login

