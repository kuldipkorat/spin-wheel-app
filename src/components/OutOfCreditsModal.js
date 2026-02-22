import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { COLORS } from '../constants/theme';

const { width } = Dimensions.get('window');

export default function OutOfCreditsModal({ visible, type, onWatchAd, onClose }) {
    const isSpin = type === 'spins';

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onHide={() => { }}
        >
            <View style={styles.overlay}>
                <View style={styles.modalCard}>
                    <Text style={styles.emoji}>🏪</Text>
                    <Text style={styles.title}>Oops! Out of {isSpin ? 'Spins' : 'Scratch Cards'}</Text>
                    <Text style={styles.message}>
                        Watch a short video to get 5 more for free and keep winning!
                    </Text>

                    <TouchableOpacity style={styles.adButton} onPress={onWatchAd} activeOpacity={0.8}>
                        <Text style={styles.adButtonText}>Watch Ad & Refill</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.closeButtonText}>Maybe Later</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalCard: {
        backgroundColor: COLORS.backgroundLight,
        width: width - 40,
        maxWidth: 400,
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.gold,
    },
    emoji: {
        fontSize: 64,
        marginBottom: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.gold,
        textAlign: 'center',
        marginBottom: 12,
    },
    message: {
        fontSize: 16,
        color: COLORS.text,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
        opacity: 0.9,
    },
    adButton: {
        backgroundColor: COLORS.gold,
        width: '100%',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 16,
        elevation: 4,
        shadowColor: COLORS.gold,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    adButtonText: {
        color: COLORS.background,
        fontSize: 18,
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 8,
    },
    closeButtonText: {
        color: COLORS.textSecondary,
        fontSize: 14,
    },
});
