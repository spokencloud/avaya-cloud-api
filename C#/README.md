# The C# API for the Avaya Public Cloud

## Prerequisites 
 1.Net Framework 4.7.2+ (Windows Environment) <br />
 2.msbuild.exe (comes with Visual studio or Visual studio build tools) <br />
 3.Packages need to be installed (can be installed using nuget package manager) <br />
        a.Microsoft.AspNet.WebApi.Client v5.2.7+ <br />
	b.Newtonsoft.Json v12.0.2+		<br />


## Build the solution using below commands from cmd
cd \<path to avayacloud-client.sln\> <br />
<Path to msbuild.exe> avayacloud-client.sln /t:Clean,Build /p:Configuration=Release

## Run the sample client 
avayacloud-client.exe

##Provide proper inputs as per the requests. Avaya cloud URL e.g https://integration.bpo.avaya.com/

