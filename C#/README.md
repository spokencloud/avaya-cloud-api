# The C# API for the Avaya Public Cloud

## Prerequisites 
 1.Net Framework 4.7.2+ (Windows Environment)
 2.msbuild.exe (comes through Visual studio or Visual studio build tools)
 3.Packages need to be installed (can be installed using nuget package manager)
 	1.Microsoft.AspNet.WebApi.Client v5.2.7+
	2.Newtonsoft.Json v12.0.2+


## Build the solution using below commands from cmd
cd <path to avayacloud-client.sln>
<Path to msbuild.exe> avayacloud-client.sln /t:Clean,Build /p:Configuration=Release

## Run the sample client 
avayacloud-client.exe <https path to spokenabc> <spokenabcusername> <spokenabcuserpassword>
e.g. avayacloud-client.exe http://localhost:8081 prov1 spoken@1 
     avayacloud-client.exe https://login.bpo.avaya.com StoreAPIProvisioner <password>
