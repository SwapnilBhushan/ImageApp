import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {fetchRecentImages} from './apiService';
import NetInfo from '@react-native-community/netinfo';
import FastImage from 'react-native-fast-image';

const {height, width} = Dimensions.get('window');

const Test = () => {
  const [recentImages, setRecentImages] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const bottomRef = useRef();
  const topRef = useRef();
  const fetchData = async () => {
    try {
      const apiImages = await fetchRecentImages();
      setRecentImages(apiImages);

      AsyncStorage.setItem('recentImages', JSON.stringify(apiImages));
    } catch (error) {
      console.error('Error fetching images:', error);
    }
  };

  const handleConnectivityChange = isConnected => {
    if (isConnected) {
      fetchData();
    }
  };

  useEffect(() => {
    const fetchImagesFromStorage = async () => {
      try {
        const storedImages = await AsyncStorage.getItem('recentImages');
        if (storedImages) {
          setRecentImages(JSON.parse(storedImages));
        }
      } catch (error) {
        console.error('Error fetching images from storage:', error);
      }
    };

    const unsubscribe = NetInfo.addEventListener(state => {
      handleConnectivityChange(state.isConnected);
    });

    fetchImagesFromStorage();

    return () => {
      unsubscribe();
    };
  }, []);

  const renderThumbnail = (item, index) => (
    <TouchableOpacity
      style={{
        width: 90,
        height: 90,
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
      onPress={() => {
        setSelectedIndex(index);
        topRef.current.scrollToIndex({animated: true, index: index});
      }}>
      <FastImage
        source={{uri: item.url_s}}
        style={{
          width: 70,
          height: 70,
          borderWidth: selectedIndex === index ? 1 : 0,
          borderColor: '#000',
          borderRadius: 10,
        }}
      />
    </TouchableOpacity>
  );

  return (
    <View>
      <View>
        <FlatList
          data={recentImages}
          ref={topRef}
          onScroll={e => {
            const index = (e.nativeEvent.contentOffset.x / width).toFixed(0);
            setSelectedIndex(index);
            bottomRef.current.scrollToIndex({
              animated: true,
              index: index,
            });
          }}
          horizontal
          pagingEnabled
          keyExtractor={item => item.id.toString()}
          renderItem={({item, index}) => (
            <View>
              <Image
                source={{uri: item.url_s}}
                style={{width: width, height: height - 100}}
              />
            </View>
          )}
        />
      </View>

      <View style={{position: 'absolute', bottom: 10}}>
        <FlatList
          ref={bottomRef}
          horizontal
          pagingEnabled
          initialScrollIndex={selectedIndex}
          showsHorizontalScrollIndicator={false}
          data={recentImages}
          keyExtractor={item => item.id}
          renderItem={({item, index}) => renderThumbnail(item, index)}
        />
      </View>
    </View>
  );
};

export default Test;
