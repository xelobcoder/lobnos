"use client";
import React, { useEffect, useState } from 'react';
import { customFetch } from '../../../../components/Auth/customFetch';
import { RiCakeLine, RiPhoneLine, RiWhatsappLine, RiMailLine } from '@remixicon/react';
import styles from './BirthdayWishes.module.css';

interface BirthdayPerson {
    patientid: number;
    fullname: string;
    mobile_number: string;
    whatAppcontact: string;
    email: string;
    birthday_date: string;
    current_age: number;
}

interface BirthdayResponse {
    success: boolean;
    data: BirthdayPerson[];
    count: number;
}

export default function BirthdayWishes() {
    const [birthdays, setBirthdays] = useState<BirthdayPerson[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTodaysBirthdays = async () => {
            setIsLoading(true);
            try {
                const response = await customFetch('birthday-events/today');

                if (response.success) {
                    const data = Array.isArray(response.data) ? response.data : [];
                    setBirthdays(data);
                } else {
                    setError('Failed to fetch today\'s birthdays');
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred while fetching birthdays');
            } finally {
                setIsLoading(false);
            }
        };

        fetchTodaysBirthdays();
    }, []);

    if (isLoading) {
        return <div className={styles.loading}>Loading todays birthdays...</div>;
    }

    if (error) {
        return <div className={styles.error}>{error}</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>
                    <RiCakeLine className={styles.headerIcon} />
                    Todays Birthdays
                </h2>
                <span className={styles.count}>Total: {birthdays.length}</span>
            </div>
            <div className={styles.birthdayList}>
                {birthdays.map((person) => (
                    <div key={person.patientid} className={styles.birthdayCard}>
                        <div className={styles.cardHeader}>
                            <h3>{person.fullname}</h3>
                            <span className={styles.age}>{person.current_age} years</span>
                        </div>
                        <div className={styles.birthdayInfo}>
                            <p>
                                <RiCakeLine className={styles.icon} />
                                Birthday: {person.birthday_date}
                            </p>
                        </div>
                        <div className={styles.contactInfo}>
                            <p><RiPhoneLine className={styles.icon} />{person.mobile_number}</p>
                            <p><RiWhatsappLine className={styles.icon} />{person.whatAppcontact}</p>
                            <p><RiMailLine className={styles.icon} />{person.email}</p>
                        </div>
                    </div>
                ))}
                {birthdays.length === 0 && (
                    <div className={styles.noBirthdays}>
                        <RiCakeLine size={48} />
                        <p>No birthdays today</p>
                    </div>
                )}
            </div>
        </div>
    );
}
