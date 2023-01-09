# Archive

## FOR 01/09/2023
### Notes
- **IMPORTANT**: Is the API key for SGmail still valid?
- **IMPORTANT**: Do we have access to MongoDB Atlas Cluster? If not, we have the code here to hook in a new URI and get a cluster going under an admin through Doug or Adam
- **CRITICAL UPDATE**: WE HAVE A SERVER GOING BABY! (TEMP)
- **IMPORTANT**: Branch opened ref(Server_Dev) to host the updated, executable server code
- **CRITICAL UPDATE**: BEGAN WORK ON FRONT END RECOVERY -> SO FAR, SO GOOD!!
- **HOLY SHIT MOMENT**: JUST CONNECTED THE BACK END AND FRONT END BACK TOGETHER IN A DEV ENVIRONMENT- WITH SOME CONFIGURATION IM CERTAIN WE WILL BE ON TRACK TO MVP IN NO TIME!!! (See proof image below)
- **IMPORTANT**: API routes tested w/ Postman- what is testable, is functional!

<img src="https://www.dl.dropboxusercontent.com/s/2jg188n7qtg10mm/BEFETie.png?dl=0" alt="Confirmed back end to front end tie">

**WARNING**: DO **NOT** PULL ref(Server_Dev) INTO ref(MAIN) BRANCH!!!

<img src="https://dl.dropboxusercontent.com/s/orwed3h58i36mlk/ServerLogSuccess.png?dl=0" alt="Server successfully established">
<img src="https://dl.dropboxusercontent.com/s/85ns08uzc3j5moc/IndexLogSuccess.png?dl=0" alt="Index successfully established">

### Docs
- **EXCALIDRAW**: [Back End Architecture Analysis](https://excalidraw.com/#json=0p3dGlWgO5SEZTntivmFW,uLbi-t_aRWrDYNE_vR9-0g)
  - REF: [Morgan](https://github.com/expressjs/morgan)
  - REF: [Moment](https://github.com/moment/moment)
  - REF: [SocketIO Docs](https://socket.io/docs/v4/)
- **DROPBOX**: [Simplified Data Models](https://www.dropbox.com/s/6iwpmcq9jcvos3g/Models.jsonc?dl=0)
- **EXCALIDRAW**: [APIRouter&Controller Mappings](https://excalidraw.com/#json=nPVf6hlDmpPetIibQG8uI,Ct3JlVL_lQyziEA0cSY2kA)

### Problems and Solutions Report

#### P: Front end deprecated, not running, and overall just an execution nightmare.
- S: Update the global NODE_OPTIONS env to include --openssl-legacy-provider prior to serving
    - For Windows: set Node_OPTIONS
    - For Mac: export NODE_OPTIONS

#### P: Back end deprecated, not running, and overall just an execution nightmare.
- S: This was a multistep process:
    1. Transfer the server code to fresh directory with a fresh install of node
    2. Reinstall necessary node packages
    3. Update MONGO_URI env to proper value
    4. Update SGmail env to proper value
    5. Check dotenv implementation
    6. Run dev server w/ npm run dev

#### P: Misspellings across API routes
- S: Check routes via Postman and determine where the misspellings have a significant impact on the overall functionality vs code-readability of the webapp

#### P: Tying the back end and front end together for deployment
- Poss.S: One solution I propose is deploying the server separately from the front-end, which is typically recommended anyways, but this could impact costs if this wasn't the prior plan.
    - Benefits:
        - Easier to scale in the long-term
        - Easier to maintain
        - Recommended method for deployment to guarantee smoothe user experiences
    - Cons:
        - Cost -> Paying for both server and client hosting
        - Could result in third-party cookie blocking problems (if used)
- Poss.S: Another possible solution is deploying the package as a whole, though this is not typically recommended UNLESS cross-site/third-party cookies/requests could prove problematic otherwise
    - Benefits:
        - Monolithic style code deployment
        - Easier maintenance of cross-site requests (API maintenance)
        - Only pay for 1 hosting service
        - No problems with third-party cookie or request blocking
    - Cons:
        - NOT recommended for enterprise apps normally (there are **exceptions**)
        - Could result in an intense rewrite and restructure of directories **IF** they are not structured in a way to already approach this solution effectively

#### P: Login functionality down until SGMail link is updated? Or is it a role problem? The question consists of possible solutions, but I need further comment on this issue to move further. (At least the API is functioning and fairly well in-tact)

**OPEN TO ANY SOLUTIONS NOT ALREADY MENTIONED**

