import { View, Text, Image, TextInput, TouchableOpacity} from 'react-native'
import React, { useEffect, useState } from 'react'
import tw from 'twrnc'
import { StatusBar } from 'expo-status-bar'
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated'
import { useNavigation } from '@react-navigation/native'
import Ionicons from 'react-native-vector-icons/Ionicons'
import * as Yup from 'yup'
import { Formik } from 'formik'
import axios from "axios"
import Toast from 'react-native-toast-message'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Constants from 'expo-constants'
import { fontStyle } from '../assets/fonts/fontstyle'

const SERVER_URL = Constants.expoConfig.extra.SERVER_URL
const PAGE_URL = `${SERVER_URL}/users`

export const loginUser = async (email, password) => {
    try {
      const response = await axios.post(`${PAGE_URL}/login`, { email, password })
      return response.data
    } catch (error) {
        const { status, data } = error.response
        if (status === 401) {
          if (data.message === "User Does Not Exist") {
              Toast.show({type: "error", text1: "Login Failed", text2: "User doesn\'t exist", position: 'bottom'})
          } else if (data.message === "Incorrect Password") {
              Toast.show({type: "error", text1: "Login Failed", text2: "Incorrect password", position: 'bottom'})
          }
        }
        return error.response?.data
    }
}

const validationSchema = Yup.object().shape({
    email: Yup.string().required("Email is required.").email().label("Email"),
    password: Yup.string().required("Password is required.").min(4).label("Password"),
})

const getImageSize = (imageSource) => {
    const { width, height } = Image.resolveAssetSource(imageSource)
    return { width, height }
}

export default function LoginScreen() {
    const navigation = useNavigation()

    useEffect(() => {
        const checkLoginStatus = async () => {
            const token = await AsyncStorage.getItem('token')

            if (token) {
                navigation.replace("Main")
            }
        }

        checkLoginStatus()
    }, [])

    const [imageSizes, setImageSizes] = useState({
        logo: { width: 0, height: 0 },
    })

    const [showPass, setShowPass] = useState(true)

    const handleLogin = async (values) => {
        const { email, password } = values
        const result = await loginUser(email, password)
    
        if (result.token) {
            await AsyncStorage.multiSet([
                ['username', result.name],
                ['email', email],
                ['id', result.id],
                ['token', result.token]
            ])
    
            Toast.show({text1: "Login Successful", text2: `Welcome, ${result.name}`, type:"success", position: 'bottom'})
            navigation.replace("Main")
        }
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

    return (
        <View style={tw`bg-white h-full w-full`}>
            <StatusBar style='light'/>

            <View style={tw`flex-row justify-around w-full absolute mt-20`}>
                <Animated.Image entering={FadeInUp.delay(200).duration(1000).springify()} style={{width: imageSizes.logo.width, height: imageSizes.logo.height}} source={require('../assets/images/Logo.png')}/>
            </View>

            <View style={tw`h-full w-full justify-start pt-60 pb-10 mt-12`}>
                <View style={tw`items-center mb-5`}>
                    <Animated.Text entering={FadeInUp.duration(1000).springify()} style={tw`text-[#0081E4] font-bold tracking-wider text-5xl`}>Login</Animated.Text>
                </View>

                <View style={tw`flex items-center mx-4 gap-y-4`}>
                    <Formik initialValues={{email: "", password: ""}} onSubmit={handleLogin} validationSchema={validationSchema}>
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
                                            placeholder='Password' 
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
                                <Animated.View entering={FadeInDown.delay(300).duration(1000).springify()} style={tw`items-end w-full mb-10`}>
                                    <TouchableOpacity onPress={() => navigation.push('ForgotPassword')}>
                                        <Text style={tw`text-[#0081E4] font-bold`}>
                                            Forgot Password
                                        </Text>
                                    </TouchableOpacity>
                                </Animated.View>
                                <Animated.View entering={FadeInDown.delay(400).duration(1000).springify()} style={tw`flex-row justify-center mb-10`}>
                                    <Text style={tw`font-bold`}>Do not have an account? </Text>
                                    <TouchableOpacity onPress={() => navigation.push('Signup')}>
                                        <Text style={tw`text-[#0081E4] font-bold`}>Register here!</Text>
                                    </TouchableOpacity>
                                </Animated.View>
                                <Animated.View entering={FadeInDown.delay(600).duration(1000).springify()} style={tw`w-50 h-16 self-center`}>
                                    <TouchableOpacity style={tw`w-full bg-[#0081E4] p-3 rounded-2xl mb-3 h-16 justify-center`} onPress={handleSubmit}>
                                        <Text style={tw`text-xl font-bold text-white text-center`}>Login</Text>
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