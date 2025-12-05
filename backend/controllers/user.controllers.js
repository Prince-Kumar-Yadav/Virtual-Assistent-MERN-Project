// import uploadOnCloudinary from "../config/cloudinary.js"
// import geminiResponse from "../gemini.js"
// import User from "../models/user.model.js"
// import moment from "moment"
//  export const getCurrentUser=async (req,res)=>{
//     try {
//         const userId=req.userId
//         const user=await User.findById(userId).select("-password")
//         if(!user){
//             return res.status(400).json({message:"user not found"})
//         }

//    return res.status(200).json(user)     
//     } catch (error) {
//        return res.status(400).json({message:"get current user error"}) 
//     }
// }

// export const updateAssistant=async (req,res)=>{
//    try {
//       const {assistantName,imageUrl}=req.body
//       let assistantImage;
// if(req.file){
//    assistantImage=await uploadOnCloudinary(req.file.path)
// }else{
//    assistantImage=imageUrl
// }

// const user=await User.findByIdAndUpdate(req.userId,{
//    assistantName,assistantImage
// },{new:true}).select("-password")
// return res.status(200).json(user)

      
//    } catch (error) {
//        return res.status(400).json({message:"updateAssistantError user error"}) 
//    }
// }


// export const askToAssistant=async (req,res)=>{
//    try {
//       const {command}=req.body
//       const user=await User.findById(req.userId);
//       user.history.push(command)
//       user.save()
//       const userName=user.name
//       const assistantName=user.assistantName
//       const result=await geminiResponse(command,assistantName,userName)

//       const jsonMatch=result.match(/{[\s\S]*}/)
//       if(!jsonMatch){
//          return res.ststus(400).json({response:"sorry, i can't understand"})
//       }
//       const gemResult=JSON.parse(jsonMatch[0])
//       console.log(gemResult)
//       const type=gemResult.type

//       switch(type){
//          case 'get-date' :
//             return res.json({
//                type,
//                userInput:gemResult.userInput,
//                response:`current date is ${moment().format("YYYY-MM-DD")}`
//             });
//             case 'get-time':
//                 return res.json({
//                type,
//                userInput:gemResult.userInput,
//                response:`current time is ${moment().format("hh:mm A")}`
//             });
//              case 'get-day':
//                 return res.json({
//                type,
//                userInput:gemResult.userInput,
//                response:`today is ${moment().format("dddd")}`
//             });
//             case 'get-month':
//                 return res.json({
//                type,
//                userInput:gemResult.userInput,
//                response:`today is ${moment().format("MMMM")}`
//             });
//       case 'google-search':
//       case 'youtube-search':
//       case 'youtube-play':
//       case 'general':
//       case  "calculator-open":
//       case "instagram-open": 
//        case "facebook-open": 
//        case "weather-show" :
//          return res.json({
//             type,
//             userInput:gemResult.userInput,
//             response:gemResult.response,
//          });

//          default:
//             return res.status(400).json({ response: "I didn't understand that command." })
//       }
     

//    } catch (error) {
//   return res.status(500).json({ response: "ask assistant error" })
//    }
// }


// Importing dependencies and modules
import uploadOnCloudinary from "../config/cloudinary.js"  // Function to upload images/files to Cloudinary
import geminiResponse from "../gemini.js"                 // Function to get AI (Gemini) response
import User from "../models/user.model.js"                // MongoDB user model
import moment from "moment"                               // Library to handle date and time formatting


//  1️⃣ Function to get the currently logged-in user
export const getCurrentUser = async (req, res) => {
    try {
        const userId = req.userId // Get user ID from authentication middleware (stored in req.userId)

        // Find user by ID, but exclude the password field for security
        const user = await User.findById(userId).select("-password")

        if (!user) {
            // If no user found, send error response
            return res.status(400).json({ message: "user not found" })
        }

        // If user found, return user data
        return res.status(200).json(user)

    } catch (error) {
        // Catch any unexpected errors
        return res.status(400).json({ message: "get current user error" })
    }
}



// 🧠 2️⃣ Function to update the assistant (name or image)
export const updateAssistant = async (req, res) => {
    try {
        const { assistantName, imageUrl } = req.body  // Extract assistant name and image URL from request body
        let assistantImage

        // If user uploads a new image file, upload it to Cloudinary
        if (req.file) {
            assistantImage = await uploadOnCloudinary(req.file.path)
        } else {
            // Otherwise, use existing image URL from request body
            assistantImage = imageUrl
        }

        // Update the user's assistant details in the database
        const user = await User.findByIdAndUpdate(
            req.userId,                           // Find user by ID
            { assistantName, assistantImage },    // Update fields
            { new: true }                         // Return updated document
        ).select("-password")                     // Exclude password from result

        // Send updated user info as response
        return res.status(200).json(user)

    } catch (error) {
        // Catch errors during update
        return res.status(400).json({ message: "updateAssistantError user error" })
    }
}



// 🧠 3️⃣ Function to handle user commands sent to the AI assistant
export const askToAssistant = async (req, res) => {
    try {
        const { command } = req.body // Get user's command (input text)

        // Find the current logged-in user
        const user = await User.findById(req.userId)

        // Save the command in user's history (for record)
        user.history.push(command)
        user.save()

        // Extract user and assistant names for personalization
        const userName = user.name
        const assistantName = user.assistantName

        // Get AI-generated response from Gemini
        const result = await geminiResponse(command, assistantName, userName)

        // Gemini is expected to return a string containing a JSON object.
        // Extract JSON portion using regex (to handle extra text around it)
        const jsonMatch = result.match(/{[\s\S]*}/)

        // If no JSON found in response, return an error
        if (!jsonMatch) {
            return res.status(400).json({ response: "sorry, i can't understand" })
        }

        // Parse the JSON part of the AI response
        const gemResult = JSON.parse(jsonMatch[0])
        console.log(gemResult)

        // Extract type (defines what kind of task AI wants to do)
        const type = gemResult.type

        // 🧩 Handle different command types
        switch (type) {

            // 1️⃣ Return current date
            case 'get-date':
                return res.json({
                    type,
                    userInput: gemResult.userInput,
                    response: `current date is ${moment().format("YYYY-MM-DD")}`
                });

            // 2️⃣ Return current time
            case 'get-time':
                return res.json({
                    type,
                    userInput: gemResult.userInput,
                    response: `current time is ${moment().format("hh:mm A")}`
                });

            // 3️⃣ Return current day (e.g., Monday)
            case 'get-day':
                return res.json({
                    type,
                    userInput: gemResult.userInput,
                    response: `today is ${moment().format("dddd")}`
                });

            // 4️⃣ Return current month (e.g., October)
            case 'get-month':
                return res.json({
                    type,
                    userInput: gemResult.userInput,
                    response: `today is ${moment().format("MMMM")}`
                });

            // 5️⃣ Handle general tasks or searches
            case 'google-search':
            case 'youtube-search':
            case 'youtube-play':
            case 'general':
            case 'calculator-open':
            case 'instagram-open':
            case 'facebook-open':
            case 'weather-show':
                return res.json({
                    type,
                    userInput: gemResult.userInput,
                    response: gemResult.response,
                });

            // 🚫 If type is not recognized
            default:
                return res.status(400).json({ response: "I didn't understand that command." })
        }

    } catch (error) {
        // Catch any unexpected error
        return res.status(500).json({ response: "ask assistant error" })
    }
}
