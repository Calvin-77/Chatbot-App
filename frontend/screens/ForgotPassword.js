import { View, Text, Image, TextInput, TouchableOpacity} from 'react-native'
import React, { useEffect, useState } from 'react'
import tw from 'twrnc'
import { StatusBar } from 'expo-status-bar'
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated'
import { useNavigation } from '@react-navigation/native'
import Ionicons from 'react-native-vector-icons/Ionicons'
import * as Yup from 'yup'
import { Formik } from 'formik'
import axios from 'axios'
import Toast from 'react-native-toast-message'
import Constants from 'expo-constants'

const SERVER_URL = Constants.expoConfig.extra.SERVER_URL
const PAGE_URL = `${SERVER_URL}/users`

export const changePassword = async (email, newPassword) => {
    try {
        const response = await axios.post(`${PAGE_URL}/change-password`, { email, newPassword })
        return response.data
    } catch (error) {
        console.error("Error in changePassword:", error.response?.data || error.message)
        if (error.response) {
            const { data } = error.response
            Toast.show({ type: "error", text1: "Action Failed", text2: data?.message || "An error occurred", position: 'bottom' })
            return { message: data?.message || "An error occurred" }
        } else {
            Toast.show({ type: "error", text1: "Action Failed", text2: "Something went wrong", position: 'bottom' })
            return { message: "Something went wrong" }
        }
    }
}

const validationSchema = Yup.object().shape({
    email: Yup.string().required("Email is required.").email().label("Email"),
    password: Yup.string().required("Password is required.").min(4).label("Password"),
    confPassword: Yup.string().required("This field is required.").min(4).label("ConfPassword").oneOf([Yup.ref("password")], "Passwords must match"),
})

const getImageSize = (imageSource) => {
    const { width, height } = Image.resolveAssetSource(imageSource)
    return { width, height }
}

export default function ForgotPassword() {
    const navigation = useNavigation()

    const [imageSizes, setImageSizes] = useState({
        logo: { width: 0, height: 0 },
    })

    const [showPass, setShowPass] = useState(true)
    const [showConfPass, setShowConfPass] = useState(true)

    const handleAction = async (values, { setSubmitting }) => {
        try {
            const response = await changePassword(values.email, values.password)
            console.log("Change Password Response:", response)
    
            if (response?.message === "Password updated successfully") {
                Toast.show({text1: "Action Successful", text2: "Password updated successfully", type:"success", position: 'bottom'})
                navigation.navigate("Login")
            } else {
                Toast.show({text1: "Action Failed", text2: response?.message || "An error occurred", type:"error", position: 'bottom'})
            }
        } catch (error) {
            console.error("Action error:", error)
        }
        setSubmitting(false)
    }     

    useEffect(() => {
        const logoSource = require('../assets/images/Logo.png')

        setImageSizes({
            logo: getImageSize(logoSource),
        })
    }, [])

    function onEyePress() {
        setShowPass(!showPass)
    }
    
    function onEyePress2() {
        setShowConfPass(!showConfPass)
    }

    return (
        <View style={tw`bg-white h-full w-full`}>
            <StatusBar style='light'/>

            <View style={tw`flex-row justify-around w-full absolute mt-20`}>
                <Animated.Image entering={FadeInUp.delay(200).duration(1000).springify()} style={{width: imageSizes.logo.width, height: imageSizes.logo.height}} source={require('../assets/images/Logo.png')}/>
            </View>

            <View style={tw`h-full w-full flex justify-start pt-60 pb-10 mt-12`}>
                <View style={tw`flex items-center mb-5`}>
                    <Animated.Text entering={FadeInUp.duration(1000).springify()} style={tw`text-[#0081E4] font-bold tracking-wider text-5xl`}>Forgot Password</Animated.Text>
                </View>

                <View style={tw`flex items-center mx-4 gap-y-4`}>
                    <Formik initialValues={{email: "", password: "", confPassword: ""}} onSubmit={handleAction} validationSchema={validationSchema}>
                        {({
                            handleChange,
                            handleBlur,
                            handleSubmit,
                            values,
                            errors,
                            touched,
                        }) => (
                            <View style={tw`p-5 w-full gap-y-3`}>
                                <Animated.View entering={FadeInDown.duration(1000).springify()} style={tw`bg-white flex-row rounded-2xl w-full border h-15`}>
                                    <Ionicons name="mail-outline" size={30} style={tw`self-center pl-2`}/>
                                    <TextInput
                                        style={tw`pl-3 w-full`}
                                        placeholder='Email' 
                                        placeholderTextColor={'black'} 
                                        onChangeText={handleChange('email')}
                                        onBlur={handleBlur('email')}
                                        value={values.email}
                                        keyboardType='email-address'
                                    />
                                </Animated.View>
                                {errors.email && touched.email && (
                                    <Text style={tw`text-red-500`}> {errors.email}</Text>
                                )}
                                <Animated.View entering={FadeInDown.delay(200).duration(1000).springify()} style={tw`bg-white flex-row rounded-2xl w-full border h-15 justify-between`}>
                                    <View style={tw`flex-row pl-2`}>
                                        <Ionicons name="key-outline" size={30} style={tw`self-center`}/>
                                        <TextInput
                                            style={tw`pl-3 w-12/15`}
                                            placeholder='New Password' 
                                            placeholderTextColor={'black'} 
                                            onChangeText={handleChange('password')}
                                            onBlur={handleBlur('password')}
                                            value={values.password}
                                            secureTextEntry={showPass}
                                        />
                                        
                                    </View>
                                    <Ionicons name={showPass === true ? "eye-off" : "eye"} size={30} onPress={onEyePress} style={tw`self-center pr-5 w-2/15`} color={showPass === true ? "black" : "#0081E4"}/>
                                </Animated.View>
                                {errors.password && touched.password && (
                                    <Text style={tw`text-red-500`}> {errors.password}</Text>
                                )}
                                <Animated.View entering={FadeInDown.delay(400).duration(1000).springify()} style={tw`bg-white flex-row rounded-2xl w-full border h-15 justify-between`}>
                                    <View style={tw`flex-row pl-2`}>
                                        <Ionicons name="key-outline" size={30} style={tw`self-center`}/>
                                        <TextInput
                                            style={tw`pl-3 w-12/15`}
                                            placeholder='Confirm New Password' 
                                            placeholderTextColor={'black'} 
                                            onChangeText={handleChange('confPassword')}
                                            onBlur={handleBlur('confPassword')}
                                            value={values.confPassword}
                                            secureTextEntry={showConfPass}
                                        />
                                        
                                    </View>
                                    <Ionicons name={showConfPass === true ? "eye-off" : "eye"} size={30} onPress={onEyePress2} style={tw`self-center pr-5 w-2/15`} color={showConfPass === true ? "black" : "#0081E4"}/>
                                </Animated.View>
                                {errors.confPassword && touched.confPassword && (
                                    <Text style={tw`text-red-500`}> {errors.confPassword}</Text>
                                )}
                                <Animated.View entering={FadeInDown.delay(600).duration(1000).springify()} style={tw`flex-row justify-center my-10`}>
                                    <Text style={tw`font-bold`}>Already have an account? </Text>
                                    <TouchableOpacity onPress={() => navigation.push('Login')}>
                                        <Text style={tw`text-[#0081E4] font-bold`}>Login here!</Text>
                                    </TouchableOpacity>
                                </Animated.View>
                                <Animated.View entering={FadeInDown.delay(800).duration(1000).springify()} style={tw`w-50 h-16 self-center`}>
                                    <TouchableOpacity style={tw`w-full bg-[#0081E4] p-3 rounded-2xl mb-3 h-16 justify-center`} onPress={handleSubmit}>
                                        <Text style={tw`text-xl font-bold text-white text-center`}>Confirm</Text>
                                    </TouchableOpacity>
                                </Animated.View>
                            </View>
                        )}
                    </Formik>
                </View>
            </View>
        </View>
  )
}