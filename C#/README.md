# The C# API for the Avaya Public Cloud
#Prerequisites 
# 1.Net Framework 4.7.2+ (Windows Environment)
# 2.msbuild.exe (comes through Visual studio or Visual studio build tools)


#Build the solution using below commands from cmd
cd <path to avayacloud-client.sln>
<Path to msbuild.exe> avayacloud-client.sln /t:Clean,Build /p:Configuration=Release

#Run the sample client 
avayacloud-client.exe <https path to spokenabc> <spokenabcusername> <spokenabcuserpassword>
#e.g. avayacloud-client.exe http://148.147.152.171:8086 prov1 spoken@1 
#     avayacloud-client.exe https://login.bpo.avaya.com StoreAPIProvisioner "WhHh3xG*us" 
