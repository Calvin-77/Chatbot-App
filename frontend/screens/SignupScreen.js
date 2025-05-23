import { View, Text, Image, TextInput, TouchableOpacity} from 'react-native'
import React, { useEffect, useState } from 'react'
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

const registerUser = async (username, email, password) => {
    try {
        const response = await axios.post(`${PAGE_URL}/register`, { username, email, password })
        return response.data
    } catch (error) {
        return error.response?.data || { message: "Registration failed" }
    }
}

const validationSchema = Yup.object().shape({
    username: Yup.string().required("Username is required.").label("Username"),
    email: Yup.string().required("Email is required.").email().label("Email"),
    password: Yup.string().required("Password is required.").min(4).label("Password"),
})

const getImageSize = (imageSource) => {
    const { width, height } = Image.resolveAssetSource(imageSource)
    return { width, height }
}

export default function SignupScreen() {
    const navigation = useNavigation()

    const [imageSizes, setImageSizes] = useState({
        logo: { width: 0, height: 0 },
    })

    const [showPass, setShowPass] = useState(true)

    const handleRegister = async (values, { setSubmitting }) => {
        try {
            const response = await registerUser(values.username, values.email, values.password)
            // console.log("Registration Response:", response)
    
            if (response.message === "User created") {
                Toast.show({text1: "Register Successful", text2: "Register completed", type:"success", position: 'bottom'})
                navigation.navigate("Login")
            } else {
                Toast.show({text1: "Register Failed", text2: response.message, type:"error", position: 'bottom'})
            }
        } catch (error) {
            console.error("Registration error:", error)
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

    return (
        <View style={{ backgroundColor: 'white', height: '100%', width: '100%' }}>
            <StatusBar style="light" />

            <View
                style={{
                flexDirection: 'row',
                justifyContent: 'space-around',
                width: '100%',
                position: 'absolute',
                marginTop: 80,
                }}
            >
                <Animated.Image
                entering={FadeInUp.delay(200).duration(1000).springify()}
                style={{ width: imageSizes.logo.width, height: imageSizes.logo.height }}
                source={require('../assets/images/Logo.png')}
                />
            </View>

            <View
                style={{
                height: '100%',
                width: '100%',
                justifyContent: 'flex-start',
                paddingTop: 240,
                paddingBottom: 40,
                marginTop: 48,
                }}
            >
                <View style={{ alignItems: 'center', marginBottom: 20 }}>
                <Animated.Text
                    entering={FadeInUp.duration(1000).springify()}
                    style={{
                    color: '#0081E4',
                    fontWeight: 'bold',
                    letterSpacing: 1,
                    fontSize: 40,
                    }}
                >
                    Register
                </Animated.Text>
                </View>

                <View
                style={{
                    flex: 1,
                    alignItems: 'center',
                    marginHorizontal: 16,
                    rowGap: 16,
                }}
                >
                <Formik
                    initialValues={{ username: '', email: '', password: '' }}
                    onSubmit={handleRegister}
                    validationSchema={validationSchema}
                >
                    {({
                    handleChange,
                    handleBlur,
                    handleSubmit,
                    values,
                    errors,
                    touched,
                    }) => (
                    <View style={{ padding: 20, width: '100%', rowGap: 12 }}>
                        <Animated.View
                        entering={FadeInDown.duration(1000).springify()}
                        style={{
                            backgroundColor: 'white',
                            flexDirection: 'row',
                            borderRadius: 16,
                            width: '100%',
                            borderWidth: 1,
                            height: '13%',
                        }}
                        >
                        <Ionicons
                            name="person-outline"
                            size={30}
                            style={{ alignSelf: 'center', paddingLeft: 8 }}
                        />
                        <TextInput
                            style={{ paddingLeft: 12, width: '100%' }}
                            placeholder="Username"
                            placeholderTextColor="black"
                            onChangeText={handleChange('username')}
                            onBlur={handleBlur('username')}
                            value={values.username}
                        />
                        </Animated.View>
                        {errors.username && touched.username && (
                        <Text style={{ color: 'red' }}>{errors.username}</Text>
                        )}

                        <Animated.View
                        entering={FadeInDown.duration(1000).delay(200).springify()}
                        style={{
                            backgroundColor: 'white',
                            flexDirection: 'row',
                            borderRadius: 16,
                            width: '100%',
                            borderWidth: 1,
                            height: '13%',
                        }}
                        >
                        <Ionicons
                            name="mail-outline"
                            size={30}
                            style={{ alignSelf: 'center', paddingLeft: 8 }}
                        />
                        <TextInput
                            style={{ paddingLeft: 12, width: '100%' }}
                            placeholder="Email"
                            placeholderTextColor="black"
                            onChangeText={handleChange('email')}
                            onBlur={handleBlur('email')}
                            value={values.email}
                            keyboardType="email-address"
                        />
                        </Animated.View>
                        {errors.email && touched.email && (
                        <Text style={{ color: 'red' }}>{errors.email}</Text>
                        )}

                        <Animated.View
                        entering={FadeInDown.delay(400).duration(1000).springify()}
                        style={{
                            backgroundColor: 'white',
                            flexDirection: 'row',
                            borderRadius: 16,
                            width: '100%',
                            borderWidth: 1,
                            justifyContent: 'space-between',
                            height: '13%',
                        }}
                        >
                        <View style={{ flexDirection: 'row', paddingLeft: 8 }}>
                            <Ionicons
                            name="key-outline"
                            size={30}
                            style={{ alignSelf: 'center' }}
                            />
                            <TextInput
                            style={{ paddingLeft: 12, width: '80%' }}
                            placeholder="Password"
                            placeholderTextColor="black"
                            onChangeText={handleChange('password')}
                            onBlur={handleBlur('password')}
                            value={values.password}
                            secureTextEntry={showPass}
                            />
                        </View>
                        <Ionicons
                            name={showPass ? 'eye-off' : 'eye'}
                            size={30}
                            onPress={onEyePress}
                            style={{ alignSelf: 'center', paddingRight: 20, width: '20%' }}
                            color={showPass ? 'black' : '#0081E4'}
                        />
                        </Animated.View>
                        {errors.password && touched.password && (
                        <Text style={{ color: 'red' }}>{errors.password}</Text>
                        )}

                        <Animated.View
                        entering={FadeInDown.delay(600).duration(1000).springify()}
                        style={{ flexDirection: 'row', justifyContent: 'center', marginVertical: 40 }}
                        >
                        <Text style={{ fontWeight: 'bold' }}>Already have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.push('Login')}>
                            <Text style={{ color: '#0081E4', fontWeight: 'bold' }}>
                            Login here!
                            </Text>
                        </TouchableOpacity>
                        </Animated.View>

                        <Animated.View
                        entering={FadeInDown.delay(800).duration(1000).springify()}
                        style={{ width: '50%', height: '15%', alignSelf: 'center' }}
                        >
                        <TouchableOpacity
                            style={{
                            width: '100%',
                            backgroundColor: '#0081E4',
                            padding: 12,
                            borderRadius: 16,
                            marginBottom: 12,
                            height: '100%',
                            justifyContent: 'center',
                            }}
                            onPress={handleSubmit}
                        >
                            <Text
                            style={{
                                fontSize: 18,
                                fontWeight: 'bold',
                                color: 'white',
                                textAlign: 'center',
                            }}
                            >
                            Register
                            </Text>
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