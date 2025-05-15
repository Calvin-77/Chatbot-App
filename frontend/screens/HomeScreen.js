import { View, Text, ActivityIndicator, FlatList, TextInput, TouchableOpacity } from 'react-native'
import { useEffect, useState, useCallback, useRef } from 'react'
import * as GoogleGenerativeAI from '@google/generative-ai'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { useFocusEffect, useRoute, useNavigation } from '@react-navigation/native'
import Markdown from 'react-native-markdown-display'
import Svg, { Path } from "react-native-svg"
import Animated, { FadeInDown, FadeInUp, SlideInLeft, SlideInRight } from 'react-native-reanimated'
import axios from "axios"
import AsyncStorage from "@react-native-async-storage/async-storage"
import Toast from 'react-native-toast-message'
import Constants from 'expo-constants'

const SERVER_URL = Constants.expoConfig.extra.SERVER_URL
const PAGE_URL = `${SERVER_URL}/users/chats`

const renderMessage = ({ item }) => (
  <Animated.View
    style={[
      {
        marginVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 12,
        maxWidth: '80%',
        alignSelf: item.user ? 'flex-end' : 'flex-start',
        backgroundColor: item.user ? '#0081E4' : '#E2E2E2',
      },
    ]}
    entering={
      item.user
        ? SlideInRight.duration(500)
        : SlideInLeft.duration(500)
    }
  >
    <Markdown
      style={{
        body: {
          color: item.user ? '#FFFFFF' : '#000000',
        },
        strong: {
          fontWeight: 'bold',
        },
        paragraph: {
          alignSelf: 'center',
        },
      }}
    >
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
        <View key={key} style={{ width: '100%', height: '100%', padding: 4, backgroundColor: '#E3E3E3' }}>
          <FlatList
            ListHeaderComponent={
              <Animated.View
                entering={FadeInUp.delay(400).duration(500)}
                style={{
                  alignSelf: 'center',
                  height: 360,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 24, fontWeight: 'bold' }}>
                  Hi, How can I help you? {'\u{1F60A}'}
                </Text>
              </Animated.View>
            }
            data={messages}
            ref={flatListRef}
            renderItem={renderMessage}
            keyExtractor={(item, index) => index.toString()}
            style={{ backgroundColor: '#E3E3E3', padding: 4 }}
            showsVerticalScrollIndicator={false}
          />

          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <Animated.View
              style={{ width: '80%' }}
              entering={FadeInDown.duration(500)}
            >
              <TextInput
                placeholder="Ask me anything..."
                onChangeText={setUserInput}
                onSubmitEditing={sendMessage}
                value={userInput}
                style={{
                  borderWidth: 2,
                  borderColor: 'black',
                  borderRadius: 9999,
                  padding: 16,
                  margin: 16,
                  color: 'black',
                }}
                placeholderTextColor="black"
                numberOfLines={1}
                multiline={false}
              />
            </Animated.View>

            <Animated.View
              entering={FadeInUp.duration(500)}
              style={{
                position: 'absolute',
                flexDirection: 'row',
                alignItems: 'center',
                right: 12,
                bottom: 200,
              }}
            >
              <TouchableOpacity
                onPress={handleNewChat}
                style={{
                  backgroundColor: '#0081E4',
                  padding: 8,
                  paddingTop: 14,
                  borderRadius: 20,
                  height: 60,
                  width: 140,
                  flexDirection: 'row',
                }}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 20 }}>New Chat  </Text>
                <Svg width={25} height={25} viewBox="-1.8 -1.8 24 24" fill="none">
                  <Path
                    d="M4 12H20M12 4V20"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View entering={FadeInDown.duration(500)}>
              <TouchableOpacity onPress={sendMessage}>
                <View
                  style={{
                    backgroundColor: '#0081E4',
                    height: 60,
                    width: 60,
                    borderRadius: 9999,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  {loading ? (
                    <ActivityIndicator size="large" color="#FFFFFF" style={{ paddingTop: 12 }} />
                  ) : (
                    <Svg width={175} height={175} viewBox="-4.75 -4.5 100 100">
                      <Path
                        d="M14.8325 9.17463L9.10904 14.9592L2.59944 10.8877C1.66675 10.3041 1.86077 8.88744 2.91572 8.57893L18.3712 4.05277C19.3373 3.76963 20.2326 4.67283 19.9456 5.642L15.3731 21.0868C15.0598 22.1432 13.6512 22.332 13.0732 21.3953L9.10601 14.9602"
                        stroke="#FFFFFF"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                      />
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
