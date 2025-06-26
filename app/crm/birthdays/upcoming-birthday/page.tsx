"use client";
import React, { useEffect, useState } from 'react';
import { customFetch } from '../../../../components/Auth/customFetch';
import { RiCakeLine, RiPhoneLine, RiWhatsappLine, RiMailLine, RiCalendarLine } from '@remixicon/react';
import styles from './UpcomingBirthday.module.css';

interface BirthdayPerson {
    patientid: number;
    fullname: string;
    mobile_number: string;
    whatAppcontact: string;
    email: string;
    birthday_date: string;
    current_age: number;
    days_until_birthday: number;
}

interface BirthdayResponse {
    success: boolean;
    data: BirthdayPerson[];
    total: number;
    page: number;
    totalPages: number;
    limit: number;
}

export default function UpcomingBirthday() {
    const [birthdays, setBirthdays] = useState<BirthdayPerson[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });

    const fetchBirthdays = async (page: number = 1) => {
        setIsLoading(true);
        try {
            const response = await customFetch(`upcoming-birthdays?page=${page}`);

            if (response.success) {
                const data = Array.isArray(response.data) ? response.data : [];
                setBirthdays(data);
                setPagination({
                    total: response.total,
                    page: response.page,
                    totalPages: response.totalPages
                });
            } else {
                setError('Failed to fetch birthday data');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred while fetching birthdays');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBirthdays();
    }, []);

    const handleNextPage = () => {
        if (pagination.page < pagination.totalPages) {
            fetchBirthdays(pagination.page + 1);
        }
    };


    if (isLoading) {
        return <div className={styles.loading}>
            <RiCakeLine className={styles.loadingIcon} />
            Loading upcoming birthdays...
        </div>;
    }

    if (error) {
        return <div className={styles.error}>{error}</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>
                    <RiCakeLine className={styles.headerIcon} />
                    Upcoming Birthdays
                </h2>
                <span className={styles.count}>Total: {pagination.total}</span>
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
                                <RiCalendarLine className={styles.icon} />
                                {person.birthday_date}
                                {person.days_until_birthday === 0 ?
                                    <span className={styles.today}>Today!</span> :
                                    <span className={styles.daysUntil}>in {person.days_until_birthday} days</span>
                                }
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
                        <p>No upcoming birthdays found</p>
                    </div>
                )}
            </div>
            {pagination.totalPages > 1 && (
                <div className={styles.pagination}>
                    <button
                        className={styles.nextButton}
                        onClick={handleNextPage}
                        disabled={pagination.page === pagination.totalPages}
                    >
                        Next Page
                    </button>
                </div>
            )}
        </div>
    );
}
