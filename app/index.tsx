import Board from '@/components/Board'
import { Text, View } from 'react-native'

export default function Home() {
  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#d5d5d5'}}>
    <Board />
    </View>
  )
}
