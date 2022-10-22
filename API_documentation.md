# Purpose of the API
Middle man to interface with firebase, I'll try to write this as if I was trying to understandable, as I normally have a hard time reading and dealing with documentation. I listed all the functions (and examples of some of them) below. If you want to try to make your own functions, please do it with your own firebase database in your own separate project first. You can't *really* cause irreparable damage, but you can accidentally massively increase the read usages or massively increase the write usages, which I'd prefer if that didn't happen anywhere near the database. If you need me to create a function then just ask.

## The Nature of Async
Due to the fact that we have to read and write data to and from a server, we have to accept that there will be latency.
Because a program does not normally expect this latency it does everything synchronously, meaning it will do
* line 1,
* then 2, 
* then 3, 
* then 4. Each of these lines does whatever it is immediately (effectively)

Which this is technically how everything happens still while using a database what happens is we do:
* line 1, 
* line 2, 
* line 3
	* On line 3 we send a request to firebase.
	* The program, thinking we are done moves on
* line 4
	* We get an error as line 4 does something with the data we were supposed to get from line 3, but it hasn't come back yet
* 3 seconds later we get the data from line 3 back

Now we can deal with this in one of 2 ways. Javascript has an <code>await</code> keyword which means "stop the code until this function returns something". I do not know how to do this with firebase so I instead use callbacks. This just means that if you want to do something with the database and then either want to do something with data it gets back or just want to wait until it's finished you wrap the rest of what you want to do in a callback, and then the "API" (in quotes because its not a real API lol) will do whatever the callback is when firebase is done processing. This means that you'll see a lot of
```
API_call("blah", "blah", (argument1, argument2) => {
	API_call2("bleh", "bleh", (argument3, argument4) => {
		DoX(argument1, argument2, argument3, argument4);
	});
});
```
get used to this. What we're doing isn't incredibly complex so it won't be too hard and messy, but it can get pretty bad. BTW shorthand for declaring a function inside something (its called a lambda function) is 
```
(arg1, arg2, arg3, ... argN) => {

}
```
which is basically the same as
```
function my_func(arg1, arg2, arg3, ... argN) {

}
```
Lambda functions are incredibly useful as you don't actually have to make a whole new function, you kinda just wrap your code in curly brackets.

# Helpful vocab
* uid - user id, what we use to reference things as every single uid is unique and tied to your google account, so we don't even have to figure out a system to create it, google does that for us

# Database Structure
I'm going to obfuscate a large portion of database stuff, as we really don't need to have that much outwards facing control. The database structure will consist of this:
* We have a collection named `unitDirectory`
	* There is 1 document with id `active`
		* This doc contains an array of all unit numbers (and only numbers) that are being shown to the user
		* `active: {active: [14, 15, 16]}`
	* There is 1 document with id `cached`
		* This doc contains an array of all units that we no longer are showing to the user, most likely because it's too old
		* This may not be necessary as we could just delete the collection for that unit
* We have X collections (where X is the number of units) `unit[number]-notes`:
	* This is the pictures and links to docs of notes people took
	* Each document would have the data structure: `[random_id]: {createdby: name, type: [link | image], content: [link | image bytes]}`
*  We have X collections (where X is the number of units) `unit[number]-games`
	*  These are the links to study games like quizlet
	* Each document  would have the data structure: `[random_id]: {createdby: name, data: link}`
* I separate these so we can have visual separators on the webpage where you can toggle between seeing notes and seeing review games

# Users
### <code>**API_getCurrentUser()**</code>
No parameters, this is also not async, so we don't need a callback. Returns null if the user is not signed in, and returns the data of the user if they are signed in.

### <code>**API_createAuthUI(callback, redirect, redirectURL)**</code>
||Name|Type |Explanation||
|--|--|--|--|--|
||callback(userData)|function  |callback to call if sign in is a success, first argument is user data|
||redirect | boolean |if true will send page to redirectURL after successful sign-in|
||redirectURL | string|if redirect is true location to be sent to after successful sign-in|

You don't really need to worry about this. All it does is use firebase's auth system to create the "Sign-in with Google" button and sticks that inside an element with id "firebaseui-auth-container". Will call `callback` if the sign-in is successful, and if `redirect` is true set the browser's location to `redirectURL` after calling the callback.

	
# Getting Data
### <code>**API_getActiveUnits(callback)**</code>
||Name|Type |Explanation||
|--|--|--|--|--|
||callback(data)|function  |callback to call when active units are found, first argument is array of active units|

### <code>**API_getUnit(unitNumber, callback)**</code>
 ||Name|Type |Explanation||
|--|--|--|--|--|
||unitNumber|integer|The number of the unit, will get data from collection `unit[unitNumber]-games` and `unit[unitNumber]-notes` and stick them together, so best to use `API_getActiveUnits` as that should always be correct|
||callback(data)|function  |callback to call when the data of the unit is found, first argument is dictionary of data inside the unit (see below)|
##### Callback data structure:
```
{
	notes: {
		[id]: {
			createdby: "example example",
			type: "link",
			data: "google.docs.com"
		},
		[id2]: {
			createdby: "example example",
			type: "image"
			data: "78325n23523jk2134ui235uipo2138tsdhiog89sdg..."
		}
	},
	games: {
		[id3]: {
			createdby: "example example",
			data: "quizlet.com"
		}
	}
}
```

# Creating Data
### <code>**API_addNote(unitNumber, data, callback)**</code>
 ||Name|Type |Explanation||
|--|--|--|--|--|
||unitNumber|integer|The number of the unit, will add the data to collection `unit[unitNumber]-notes`|
||data|object|The data of the new item, see `Database Structure` as to what a notes object should look like||
||callback(result)|function  |callback to call when the document has been successfully added, first argument is the result, most of the time this is not used at all|

### <code>**API_addGame(unitNumber, data, callback)**</code>
 ||Name|Type |Explanation||
|--|--|--|--|--|
||unitNumber|integer|The number of the unit, will add the data to collection `unit[unitNumber]-games`|
||data|object|The data of the new item, see `Database Structure` as to what a notes object should look like||
||callback(result)|function  |callback to call when the document has been successfully added, first argument is the result, most of the time this is not used at all|