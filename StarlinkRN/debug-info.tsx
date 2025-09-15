// Debug component to check environment and routing
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { API_URL } from '@env';

export default function DebugInfo() {
    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>🔍 Debug Information</Text>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Environment Variables:</Text>
                <Text style={styles.text}>API_URL: {API_URL || 'NOT SET'}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Current Time:</Text>
                <Text style={styles.text}>{new Date().toISOString()}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Platform Info:</Text>
                <Text style={styles.text}>Platform: Web/Mobile</Text>
            </View>

            <Text style={styles.note}>
                Check the console logs for detailed routing and authentication debug information.
            </Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    section: {
        backgroundColor: 'white',
        padding: 15,
        marginBottom: 10,
        borderRadius: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    text: {
        fontSize: 14,
        color: '#666',
        fontFamily: 'monospace',
    },
    note: {
        marginTop: 20,
        padding: 15,
        backgroundColor: '#e3f2fd',
        borderRadius: 8,
        fontSize: 14,
        color: '#1976d2',
    },
});
