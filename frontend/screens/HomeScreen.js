import { View, Text, ActivityIndicator, FlatList, TextInput, TouchableOpacity } from 'react-native'
import React, { useEffect, useState, useCallback, useRef } from 'react'
import * as GoogleGenerativeAI from '@google/generative-ai'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { useFocusEffect, useRoute, useNavigation } from '@react-navigation/native'
import tw from 'twrnc'
import Markdown from 'react-native-markdown-display'
import Svg, { Path } from "react-native-svg"
import Animated, { FadeInDown, FadeInUp, SlideInLeft, SlideInRight } from 'react-native-reanimated'
import axios from "axios"
import AsyncStorage from "@react-native-async-storage/async-storage"
import Toast from 'react-native-toast-message'
import Constants from 'expo-constants'
import { fontStyle } from '../assets/fonts/fontstyle'

const SERVER_URL = Constants.expoConfig.extra.SERVER_URL
const PAGE_URL = `${SERVER_URL}/users/chats`

const renderMessage = ({ item }) => (
  <Animated.View 
      style={[
          tw`my-2 px-3 rounded-lg max-w-[80%]`, 
          item.user ? tw`bg-[#0081E4] self-end` : tw`bg-[#E2E2E2] self-start`
      ]}
      entering={item.user ? SlideInRight.duration(500) : SlideInLeft.duration(500)}>
      <Markdown style={item.user ? 
      {
          body: tw`text-white`,
          strong: tw`font-bold`,
          paragraph: tw`self-center`,
      } : {
          body: tw`text-black`,
          strong: tw`font-bold`,
          paragraph: tw`self-center`,
      }}>
          {item.text}
      </Markdown>
  </Animated.View>
)

const HomeScreen = () => {
  const route = useRoute()
  const initialChatId = route.params?.chatId || null
  const [chatId, setChatId] = useState(initialChatId)    
  const navigation = useNavigation()
  const [messages, setMessages] = useState([])
  const [userInput, setUserInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [key, setKey] = useState(0)
  const flatListRef = useRef(null); // untuk scroll ke bawah

  const API_KEY = Constants.expoConfig.extra.API_KEY

  useFocusEffect(
      useCallback(() => {
          setKey(prevKey => prevKey + 1)
      }, [])
  )

  useEffect(() => {
    if (route.params?.chatId) {
      setChatId(route.params.chatId)
    }
  }, [route.params])

  useFocusEffect(
    useCallback(() => {
      const fetchChatById = async () => {
        if (!chatId) {
          setMessages([])
          return
        }
        setLoading(true)
        try {
          const response = await axios.get(`${PAGE_URL}/${chatId}`)
          const chatDoc = response.data
          if (chatDoc && chatDoc.messages) {
            const fetchedMessages = chatDoc.messages.map(msg => ({
              text: msg.message,
              user: msg.sender === "user"
            }))
            setMessages(fetchedMessages)
          }
        } catch (error) {
          if (error.response && error.response.status === 404) {
            setChatId(null)
            setMessages([])
          }
        } finally {
          setLoading(false)
        }
      }
  
      fetchChatById()
    }, [chatId])
  )

  useEffect(() => {
    if (flatListRef.current) {
      setTimeout(() => { // gunakan setTimeout agar animasi scroll dapat berjalan setelah animasi yang lain
        flatListRef.current.scrollToEnd({ animated: true });
      }, 500)
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!userInput.trim()) return
    setUserInput("")
    const newPrompt = userInput
    setLoading(true)
    try {
        const userId = await AsyncStorage.getItem("id")

        const userMessage = { text: newPrompt, user: true }
        setMessages(prevMessages => [...prevMessages, userMessage])

        const userResponse = await axios.post(PAGE_URL, {
            userId,
            chatId,
            message: newPrompt,
            sender: "user"
        })

        if (!chatId && userResponse.data.chatId) {
            setChatId(userResponse.data.chatId)
        }

        const genAI = new GoogleGenerativeAI.GoogleGenerativeAI(API_KEY)
        const model = genAI.getGenerativeModel({ model: "models/gemini-2.0-flash" })
        const instruction = 'You are a psychology agent named Eira where you act like a psychologist and helping people overcome their problems'
        const prevPrompt = messages.map(msg => `${msg.user ? "User" : "Bot"}: ${msg.text}`).join("\n")
        const prompts = instruction + "\n\n" + prevPrompt + "\n" + "User: " + newPrompt
        const result = await model.generateContent(prompts)
        const response = result.response
        const text = await response.text()
        console.log("AI Response:", text)
        
        setMessages(prevMessages => [...prevMessages, { text, user: false }])

        await axios.post(PAGE_URL, {
            userId,
            chatId: chatId || userResponse.data.chatId,
            message: text,
            sender: "bot"
        })
    } 
    catch (err) {
      console.error("AI Error:", err);
    }
    finally {
        setLoading(false)
    }
  }

  const handleNewChat = () => {
      setKey(prevKey => prevKey + 1) // untuk re-rendering ketika masuk ke chat baru
      setChatId(null)
      setMessages([])
      navigation.setParams({ chatId: null })
      Toast.show({text1: "New Chat", text2: "Created new chat successfully", type: "success", position: "bottom"})
  }

  return (
      <GestureHandlerRootView style={{ flex: 1 }}>
          <View key={key} style={tw`w-full h-full p-1 bg-[#E3E3E3]`}>
              <FlatList
                  ListHeaderComponent={
                      <Animated.View entering={FadeInUp.delay(400).duration(500)} style={tw`self-center h-90 items-center justify-center`}>
                          <Text style={tw`text-3xl font-bold`}>Hi, How can I help you? {'\u{1F60A}'}</Text>
                      </Animated.View>
                  }
                  data={messages}
                  ref={flatListRef}
                  renderItem={renderMessage}
                  keyExtractor={(item, index) => index.toString()}
                  style={tw`bg-[#E3E3E3] p-1`}
                  showsVerticalScrollIndicator={false}
              />
              <View style={tw`flex-row justify-center items-center`}>
                  <Animated.View style={tw`w-80%`} entering={FadeInDown.duration(500)}>
                      <TextInput
                          placeholder="Ask me anything..."
                          onChangeText={setUserInput}
                          onSubmitEditing={sendMessage}
                          value={userInput}
                          style={tw`border-2 border-black rounded-full p-4 m-4`}
                          placeholderTextColor="black"
                          numberOfLines={1}
                          multiline={false}
                      />
                  </Animated.View>
                  <Animated.View entering={FadeInUp.duration(500)} style={tw`absolute flex-row items-center right-3 bottom-200`}>
                    <TouchableOpacity onPress={handleNewChat} style={tw`bg-[#0081E4] p-2 pt-3.5 rounded-5 h-15 w-35 flex-row`}>
                      <Text style={tw`text-white text-xl`}>New Chat  </Text>
                      <Svg width={25} height={25} viewBox="-1.8 -1.8 24 24" fill="none">
                          <Path d="M4 12H20M12 4V20" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </Svg>
                    </TouchableOpacity>
                  </Animated.View>
                  <Animated.View entering={FadeInDown.duration(500)}>
                      <TouchableOpacity onPress={sendMessage}>
                          <View style={tw`bg-[#0081E4] h-15 w-15 rounded-full`}>
                              {loading ? (
                                  <ActivityIndicator size="large" color="#FFFFFF" style={tw`pt-3`} />
                              ) : (
                                  <Svg width={175} height={175} viewBox="-4.75 -4.5 100 100">
                                      <Path d="M14.8325 9.17463L9.10904 14.9592L2.59944 10.8877C1.66675 10.3041 1.86077 8.88744 2.91572 8.57893L18.3712 4.05277C19.3373 3.76963 20.2326 4.67283 19.9456 5.642L15.3731 21.0868C15.0598 22.1432 13.6512 22.332 13.0732 21.3953L9.10601 14.9602" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                                  </Svg>
                              )}
                          </View>
                      </TouchableOpacity>
                  </Animated.View>
              </View>
          </View>
      </GestureHandlerRootView>
  )
}

export default HomeScreen
