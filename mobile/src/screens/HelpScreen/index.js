import React, { useMemo, useState } from 'react';
import {
    Alert,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import ThemedSafeAreaView from '../../components/layout/ThemedSafeAreaView';
import { Ionicons } from '@expo/vector-icons';
import AppButton from '../../components/ui/AppButton';
import AppScreenHeader from '../../components/ui/AppScreenHeader';
import styles from './HelpScreen.styles';

const FAQ_ITEMS = [
    {
        id: 'booking',
        question: 'How do bookings and payments work?',
        answer: 'When a renter confirms payment, the booking is secured. Payout setup is required before lenders can receive transfers for completed bookings.',
    },
    {
        id: 'cancellation',
        question: 'What if I need to cancel?',
        answer: 'Open your booking details and cancel as early as possible. Refund handling depends on booking state and payment status.',
    },
    {
        id: 'verification',
        question: 'Why is verification needed?',
        answer: 'Verification improves trust and reduces fraud risk. Some actions like payouts can require profile, address, and payment onboarding completion.',
    },
    {
        id: 'issues',
        question: 'I found an issue in the app. What should I do?',
        answer: 'Use Contact support below and include screenshots, booking/tool id, and what happened right before the issue.',
    },
];

export default function HelpScreen({ navigation }) {
    const [expandedId, setExpandedId] = useState(FAQ_ITEMS[0].id);

    const quickActions = useMemo(
        () => [
            {
                id: 'booking-help',
                title: 'Booking help',
                description: 'Common booking, payment, and cancellation questions.',
                icon: 'calendar-outline',
            },
            {
                id: 'payout-help',
                title: 'Payout help',
                description: 'Understand payout setup and readiness requirements.',
                icon: 'cash-outline',
            },
            {
                id: 'safety-help',
                title: 'Safety',
                description: 'Tips for secure renting and lending in the community.',
                icon: 'shield-checkmark-outline',
            },
        ],
        [],
    );

    const handleQuickAction = (title) => {
        Alert.alert(title, 'Detailed support article links will be added in the next update.');
    };

    const handleContactSupport = () => {
        Alert.alert(
            'Contact support',
            'For now, contact support via the channel you already use for project coordination. In-app ticketing will be added next.',
        );
    };

    return (
        <ThemedSafeAreaView>
            <AppScreenHeader
                title="Help"
                onBack={() => navigation.goBack()}
                right={(
                    <TouchableOpacity
                        style={styles.headerIconButton}
                        onPress={() => navigation.navigate('Legal')}
                    >
                        <Ionicons name="document-text-outline" size={18} color="#c4b5fd" />
                    </TouchableOpacity>
                )}
            />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.heroCard}>
                    <Text style={styles.heroEyebrow}>Support center</Text>
                    <Text style={styles.heroTitle}>How can we help today?</Text>
                    <Text style={styles.heroDescription}>
                        Get quick answers for bookings, payouts, account setup, and safety.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quick actions</Text>
                    <View style={styles.quickActionGrid}>
                        {quickActions.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                style={styles.quickActionCard}
                                activeOpacity={0.8}
                                onPress={() => handleQuickAction(item.title)}
                            >
                                <View style={styles.quickActionIconWrap}>
                                    <Ionicons name={item.icon} size={18} color="#c4b5fd" />
                                </View>
                                <Text style={styles.quickActionTitle}>{item.title}</Text>
                                <Text style={styles.quickActionDescription}>{item.description}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Frequently asked</Text>
                    <View style={styles.faqList}>
                        {FAQ_ITEMS.map((faq) => {
                            const isExpanded = expandedId === faq.id;
                            return (
                                <TouchableOpacity
                                    key={faq.id}
                                    style={styles.faqItem}
                                    onPress={() => setExpandedId(isExpanded ? null : faq.id)}
                                    activeOpacity={0.8}
                                >
                                    <View style={styles.faqHeader}>
                                        <Text style={styles.faqQuestion}>{faq.question}</Text>
                                        <Ionicons
                                            name={isExpanded ? 'chevron-up' : 'chevron-down'}
                                            size={18}
                                            color="#9ca3af"
                                        />
                                    </View>
                                    {isExpanded ? <Text style={styles.faqAnswer}>{faq.answer}</Text> : null}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                <View style={styles.supportCard}>
                    <Text style={styles.supportTitle}>Still need help?</Text>
                    <Text style={styles.supportDescription}>
                        Share your issue details and we will guide you with the right next steps.
                    </Text>
                    <AppButton title="Contact support" iconName="chatbubble-ellipses-outline" onPress={handleContactSupport} />
                </View>
            </ScrollView>
        </ThemedSafeAreaView>
    );
}

