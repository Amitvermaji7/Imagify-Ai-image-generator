import UserModel from "../models/userModel.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"



const registerUser = async (req, res) => {
    try {
        
        const { name, email, password} = req.body
            
           if (!name || !email || !password) {
            return res.json({ success: false, message: "Please fill all fields" })
           }       

            // ✅ Check if email already exists
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return res.json({ success: false, message: "Email already registered" });
        }

              const salt = await bcrypt.genSalt(10)
                const hashedPassword = await bcrypt.hash(password, salt)

                const userData = {
                    name,
                    email,
                    password: hashedPassword
                }


                const newUser = new UserModel(userData)
                const user = await newUser.save()

                const token = jwt.sign({ id: user._id}, process.env.JWT_SECRET)
                  
                 res.json({
                    success: true,
                    token,
                    user: {
                    name: user.name,
                    }               
                  })
                 
    } catch (error) {
         console.log(error)
            res.json({ success: false, message: error.message })
    }
}

const loginUser = async (req, res)=>{
try {
      const { email, password} = req.body;
      const user = await UserModel.findOne({ email })

        if (!user) {
            return res.json({ success: false, message: "User not found" })
        }
        
        const isMatch = await bcrypt.compare(password, user.password)

        if (isMatch) {
            const token = jwt.sign({ id: user._id}, process.env.JWT_SECRET)
                  
            res.json({
               success: true,
               token,
               user: {
               name: user.name,
               }               
             })
        } else {
            return res.json({ succcess: false, message: "Invalid credentials" })
        }

} catch(error) {
    console.log(error)
    res.json({ success: false, message: error.message })
    }
}

  const userCredits = async (req, res) => {
    
    try{
         const {userId} = req.body
            

        const user = await UserModel.findById(userId)
        res.json({ success: true, credits: user.creditBalance, user: {name: user.name}})

    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
}


export { registerUser, loginUser, userCredits }