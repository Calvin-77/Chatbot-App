import React, { useState, useCallback } from 'react'
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import tw from 'twrnc'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import Animated, { SlideInLeft } from 'react-native-reanimated'
import Constants from 'expo-constants'

const SERVER_URL = Constants.expoConfig.extra.SERVER_URL
const PAGE_URL = `${SERVER_URL}/users/chats/user`

const HistoryScreen = () => {
  const [chatHistory, setChatHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const navigation = useNavigation()

  useFocusEffect(
    useCallback(() => {
      const fetchHistory = async () => {
        setLoading(true)
        try {
          const userId = await AsyncStorage.getItem("id")
          const response = await axios.get(`${PAGE_URL}/${userId}`)
          const data = Array.isArray(response.data) ? response.data : [response.data]
          setChatHistory(data)
        } finally {
          setLoading(false)
        }
      }
      fetchHistory()
    }, [])
  )

  const renderChat = ({ item, index }) => {
    const title = item.messages.find(msg => msg.sender === "user")
    return (
      <Animated.View
        entering={SlideInLeft.duration(500).delay(index * 200)}
        style={tw`bg-[#DCDCDC] mb-5 p-3 rounded-lg`}
      >
        <Text style={tw`text-2xl font-bold mb-8 pt-3 pl-3`}>{title?.message}</Text>
        <TouchableOpacity
          style={tw`self-end`}
          onPress={() => navigation.navigate('Chat', { chatId: item._id.toString() })}
        >
          <View style={tw`flex-row items-center`}>
            <Text style={tw`text-[#547565]`}>Back to Chat</Text>
            <Text style={tw`text-lg mb-1 text-[#547565]`}>{'\u2192'}</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    )
  }

  return (
    <View style={tw`w-full h-full flex-1 p-4 bg-[#E3E3E3]`}>
      {loading ? (
        <ActivityIndicator size="large" color="#0081E4" style={tw`pt-3`} />
      ) : (
        <FlatList
          data={chatHistory}
          renderItem={renderChat}
          keyExtractor={(item) => item._id}
        />
      )}
    </View>
  )
}

export default HistoryScreen