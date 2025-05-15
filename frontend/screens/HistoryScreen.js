import { useState, useCallback } from 'react'
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
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
        style={{
          backgroundColor: '#DCDCDC',
          marginBottom: 20,
          padding: 12,
          borderRadius: 12,
        }}
      >
        <Text
          style={{
            fontSize: 24,
            fontWeight: 'bold',
            marginBottom: 32,
            paddingTop: 12,
            paddingLeft: 12,
          }}
        >
          {title?.message}
        </Text>

        <TouchableOpacity
          style={{ alignSelf: 'flex-end' }}
          onPress={() => navigation.navigate('Chat', { chatId: item._id.toString() })}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ color: '#547565' }}>Back to Chat</Text>
            <Text style={{ fontSize: 18, marginBottom: 4, color: '#547565' }}>{'\u2192'}</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    )
  }

  return (
    <View
      style={{
        width: '100%',
        height: '100%',
        flex: 1,
        padding: 16,
        backgroundColor: '#E3E3E3',
      }}
    >
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#0081E4"
          style={{ paddingTop: 12 }}
        />
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