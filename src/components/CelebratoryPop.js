import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import LottieView from 'lottie-react-native';

const { width, height } = Dimensions.get('window');

export default function CelebratoryPop({ visible, onFinish }) {
    const lottieRef = useRef(null);

    useEffect(() => {
        if (visible) {
            lottieRef.current?.play();
        } else {
            lottieRef.current?.reset();
        }
    }, [visible]);

    if (!visible) return null;

    return (
        <View style={styles.container} pointerEvents="none">
            <LottieView
                ref={lottieRef}
                source={{ uri: 'https://assets9.lottiefiles.com/packages/lf20_mYp6it.json' }} // Confetti/Success animation
                autoPlay={false}
                loop={false}
                onAnimationFinish={onFinish}
                style={styles.lottie}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 9999,
        justifyContent: 'center',
        alignItems: 'center',
    },
    lottie: {
        width: width,
        height: height,
    },
});
