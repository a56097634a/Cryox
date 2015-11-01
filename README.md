# Cryox

####REMINDERS
- Never push the **.meteor** directory
- __NEVER__ push to master, submit pull requests unless we are all sure of what is to be pushed to master
- Update the dependency list on your branch accordingly
- Always work on your own branches and keep up to date with master in case of any changes
	- stash any changes on your local branch
	- ```git checkout master```
	- ```git pull master```
	- ```git checkout <your_branch_name>```
	- ```git merge master```
	- apply stashed changes
	- fix any conflicts if need be

##First time setup
```
git clone https://github.com/a56097634a/Cryox.git
cd Cryox
meteor create Cryox
mv Cryox/.meteor/ .
rm -rf Cryox/
```
```meteor add <dependency>``` for all dependencies

```meteor``` (to run server on localhost:3000)

### Dependencies
iron:router
sergeyt:typeahead
