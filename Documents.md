npm create vite@latest ./

react,
typescript
react router v7
beta version
git init - no
dependencies install - yes


create an account in putter.js
--Puter.js is a JavaScript library that brings powerful auth, cloud, and AI services directly to your frontend code. It allows you to use file storage, database, OpenAI models, Claude, and more without any backend or servers.

npm run dev
--gives the landing page

explore react router docs


app/root.tsx -----> is the index file
app/route.ts -----> central routing config
app/routes/home.tsx ---->index route----> it has meta data and a welcome component

app.css - imports tailwind css

create new components---> Navbar.tsx

npm install lucide-react

create menus in navbar
create login buttons on the right corner of navbar


-------------------------------
---------------------------------
authentication using puter.js
-------------------------------
-------------------------------
npm install @heyputer/puter.js

create a file lib/puter.action.ts
Define signIn, signOut, getCurrentUser functionalities in here
Integrate this in app/root.ts using react router's useOutletContext

useOutletContext
----------------
Returns the parent route <Outlet context>.
Often parent routes manage state or other values you want shared with child routes. You can create your own context provider if you like, but this is such a common situation that it's built-into <Outlet>.
When using nested routes in React, a parent route renders an <Outlet /> to display child routes.

If you want to pass data from the parent route to its child routes, you can use
create a new type- AuthState and AuthContext in type.d.ts file
declare a var for this AuthState in App() of root.ts file.  This means this var is available in all pages
eg:const [authState, setAuthState] = useState<AuthState>(DEFAULT_AUTH_STATE);

define refreshAuth function
use it in useEffect-- on page load
call puterSignIn from signIn function and
puterSignOut from SignOut function

spread these function viz authState, refreshAuth, signIn, signOut in the context of Outlet.
eg: <Outlet context={{...authState, refreshAuth,singIn, singOut}}/>
this means these functions are available in all pages.

Implement these signIn and signout functions in the login logout button on  navbar component


git push

work with home page then git push

create a branch "upload-files"

create a component upload.tsx

ask junie to do:
--------------
update the Upload component by adding drag and drop handlers and 
an onChange function that passes files to a new processFile 
function. Inside processFile, use FileReader to get a Base64 
string and setInterval to increment progress using constants 
from lib/constants.ts file. When progress reaches 100, clear 
the interval and call onComplete with the Base64 data after a 
REDIRECT_DELAY_MS delay.  Ensure all upload logic is blocked 
if isSignedIn is false and the dropZone UI reflects the 
isDragging state.

create a component visualizer, add in the routes,
redirect the page to visualizer/id with function handleUploadComplete 
In this function create a new id with current date and timestamp.









import React, {useState} from 'react'
import {useOutletContext} from "react-router";
import {CheckCircle2, ImageIcon, UploadIcon} from "lucide-react";

const Upload = () => {

	const [file, setFile] = useState<File | null>(null)
	const [isDragging, setIsDragging] = useState(false)
	const [progress, setProgress] = useState(0)

	const {isSignedIn} = useOutletContext<AuthContext>()

	return (
		<div className="upload">
			{!file ? (
				<div className={`dropzone ${isDragging ? 'is-dragging' : ''}`}>
					<input type="file" className="drop-input" accept= ".jpg, .jpeg, .png" disabled={!isSignedIn } />
					<div className="dropzone-content">
						<div className="drop-icon">
							<UploadIcon size={20} />
						</div>
						<p>
							{isSignedIn ? (
								"Click to upload or just drag and drop"
							):("Sign in or sign up with Puter to upload")}
						</p>
						<p className="hrlp">Maximum file size 50 MB.</p>
					</div>
				</div>
			):(
				<div className="upload-status">
					<div className="status-content">
						<div className="status-icon">
							{progress === 100 ? (
								<CheckCircle2 className="check"  />
							):(
								<ImageIcon className="image" />
							)}
						</div>
						<h3>{file.name}</h3>
						<div className="progress">
							<div className="bar" style={{width: `${progress}%`}} />
							<p className="status-text">
								{progress < 100 ? 'Analyzing Floor Plan...' : 'Redirecting...'}
							</p>
						</div>
					</div>
				</div>
			)}

		</div>
	)
}
export default Upload;



