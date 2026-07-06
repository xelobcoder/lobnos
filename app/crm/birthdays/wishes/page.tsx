"use client";
import React, { useEffect, useState } from 'react';
import { customFetch } from '../../../../components/Auth/customFetch';
import { RiCakeLine, RiPhoneLine, RiWhatsappLine, RiMailLine } from '@remixicon/react';
import styles from './BirthdayWishes.module.css';

type BirthdaySectionKey = 'today' | 'upcoming' | 'week' | 'month';

interface BirthdayPerson {
    patientid: number;
    fullname: string;
    mobile_number: string;
    whatAppcontact?: string | null;
    email?: string | null;
    birthday_date: string;
    current_age: number;
    days_until_birthday?: number;
}

interface BirthdaySectionData {
    data: BirthdayPerson[];
    total: number;
    page: number;
    totalPages: number;
}

const defaultSection = (): BirthdaySectionData => ({
    data: [],
    total: 0,
    page: 1,
    totalPages: 1,
});

const sectionMeta: Record<BirthdaySectionKey, { title: string; subtitle: string }> = {
    today: { title: 'Today', subtitle: "Today's birthdays" },
    upcoming: { title: 'Upcoming', subtitle: 'Next birthdays' },
    week: { title: 'This week', subtitle: 'Birthdays this week' },
    month: { title: 'This month', subtitle: 'Birthdays this month' },
};

const endpointMap: Record<BirthdaySectionKey, string> = {
    today: 'birthday-events/today',
    upcoming: 'upcoming-birthdays',
    week: 'birthday-events/week',
    month: 'birthday-events/month',
};

const normalizeSectionData = (payload: any): BirthdaySectionData => {
    const responseData = payload?.data;
    const list = Array.isArray(responseData)
        ? responseData
        : Array.isArray(responseData?.data)
            ? responseData.data
            : [];

    const total = typeof responseData?.total === 'number'
        ? responseData.total
        : Array.isArray(responseData)
            ? responseData.length
            : list.length;

    return {
        data: list,
        total,
        page: payload?.page ?? responseData?.page ?? 1,
        totalPages: payload?.totalPages ?? responseData?.totalPages ?? 1,
    };
};

export default function BirthdayWishes() {
    const [activeTab, setActiveTab] = useState<BirthdaySectionKey>('today');
    const [sections, setSections] = useState<Record<BirthdaySectionKey, BirthdaySectionData>>({
        today: defaultSection(),
        upcoming: defaultSection(),
        week: defaultSection(),
        month: defaultSection(),
    });
    const [loadedTabs, setLoadedTabs] = useState<Record<BirthdaySectionKey, boolean>>({
        today: false,
        upcoming: false,
        week: false,
        month: false,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchSection = async (sectionKey: BirthdaySectionKey) => {
        if (loadedTabs[sectionKey]) {
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await customFetch(endpointMap[sectionKey]);
            const normalized = normalizeSectionData(response);

            setSections((prev) => ({ ...prev, [sectionKey]: normalized }));
            setLoadedTabs((prev) => ({ ...prev, [sectionKey]: true }));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred while fetching birthday data');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        void fetchSection(activeTab);
    }, [activeTab]);

    const activeSection = sections[activeTab];


    const renderPersonCard = (person: BirthdayPerson, sectionKey: BirthdaySectionKey) => (
        <div key={person.patientid} className={styles.birthdayCard}>
            <div className={styles.cardHeader}>
                <h3>{person.fullname}</h3>
                <span className={styles.age}>{person.current_age} years</span>
            </div>
            <div className={styles.metaRow}>
                <span className={styles.metaBadge}>{sectionMeta[sectionKey].title}</span>
                {typeof person.days_until_birthday === 'number' && (
                    <span className={styles.metaBadgeSecondary}>
                        In {person.days_until_birthday} day{person.days_until_birthday === 1 ? '' : 's'}
                    </span>
                )}
            </div>
            <div className={styles.birthdayInfo}>
                <p>
                    <RiCakeLine className={styles.icon} />
                    Birthday: {person.birthday_date}
                </p>
            </div>
            <div className={styles.contactInfo}>
                {person.mobile_number ? (
                    <p>
                        <RiPhoneLine className={styles.icon} />
                        {person.mobile_number}
                    </p>
                ) : null}
                {person.whatAppcontact ? (
                    <p>
                        <RiWhatsappLine className={styles.icon} />
                        {person.whatAppcontact}
                    </p>
                ) : null}
                {person.email ? (
                    <p>
                        <RiMailLine className={styles.icon} />
                        {person.email}
                    </p>
                ) : null}
            </div>
        </div>
    );

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h2>
                        <RiCakeLine className={styles.headerIcon} />
                        Birthday Events
                    </h2>
                    <p className={styles.subtitle}>Browse birthdays by category</p>
                </div>
            </div>

            <div className={styles.tabs} role="tablist" aria-label="Birthday sections">
                {(Object.keys(sectionMeta) as BirthdaySectionKey[]).map((sectionKey) => {
                    const isActive = activeTab === sectionKey;
                    return (
                        <button
                            key={sectionKey}
                            type="button"
                            className={`${styles.tabButton} ${isActive ? styles.activeTab : ''}`}
                            onClick={() => setActiveTab(sectionKey)}
                        >
                            {sectionMeta[sectionKey].title}
                        </button>
                    );
                })}
            </div>

            <section className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                    <div>
                        <h3>{sectionMeta[activeTab].title}</h3>
                        <p>{sectionMeta[activeTab].subtitle}</p>
                    </div>
                    <span className={styles.sectionCount}>{activeSection.total}</span>
                </div>

                {isLoading && activeSection.data.length === 0 ? (
                    <div className={styles.loading}>Loading birthday data...</div>
                ) : null}

                {error && activeSection.data.length === 0 ? (
                    <div className={styles.error}>{error}</div>
                ) : null}

                {!isLoading && !error && activeSection.data.length === 0 ? (
                    <div className={styles.noBirthdays}>
                        <RiCakeLine size={48} />
                        <p>No {sectionMeta[activeTab].title.toLowerCase()} birthdays</p>
                    </div>
                ) : null}

                {!isLoading && !error && activeSection.data.length > 0 ? (
                    <div className={styles.birthdayList}>{activeSection.data.map((person) => renderPersonCard(person, activeTab))}</div>
                ) : null}
            </section>
        </div>
    );
}
