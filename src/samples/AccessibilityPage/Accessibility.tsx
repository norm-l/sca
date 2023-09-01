import React, { useState } from 'react';
import AppHeader from '../../components/AppComponents/AppHeader';
import LogoutPopup from '../../components/AppComponents/LogoutPopup';
import AppFooter from '../../components/AppComponents/AppFooter';
import signoutHandler from '../../components/helpers/signout';
import { useTranslation } from 'react-i18next';

const linkContent = [
    {
        linkText: "CLEAR_DATA",
        href: "/",
        isNavLink: false,
    },
];

const Accessibility: React.FC = () => {
    const { t } = useTranslation();
    const [isSignoutModal, setIsSignoutModal] = useState<boolean>(null);

    const makeList = (listNumber: number, entries: number) => {
        const output = [];
        for (let i = 0; i < entries; i += 1) {
            output.push(<li key={`${listNumber}${i}`}>{t(`ACCESSIBILITY_LIST_${listNumber}_${i}`)}</li>)
        }
        return output;
    };

    return (
        <>
            <AppHeader handleSignout={() => setIsSignoutModal(false)} appname={t("CLAIM_CHILD_BENEFIT")} />
            <div className="govuk-width-container">
                <main className="govuk-main-wrapper govuk-main-wrapper--l" id="main-content" role="main">
                    <div className="govuk-grid-row">
                        <div className='govuk-grid-column-two-thirds'>
                            <h1 className="govuk-heading-l">
                                {t("ACCESSIBILITY_HEADING_1")}
                            </h1>
                            <p className='govuk-heading-m'>
                                {t("ACCESSIBILITY_HEADING_2")}
                            </p>
                            <p className='govuk-body'>{t("ACCESSIBILITY_P_1")}</p>
                            <p className='govuk-body'>{t("ACCESSIBILITY_P_2")}</p>
                            <h1 className="govuk-heading-l">
                                {t("ACCESSIBILITY_HEADING_3")}
                            </h1>
                            <p className='govuk-body'>{t("ACCESSIBILITY_P_3")}</p>
                            <p className='govuk-body'>{t("ACCESSIBILITY_P_4")}</p>
                            <ul className="govuk-list govuk-list--bullet">
                                {makeList(1, 5)}
                            </ul>
                            <p className='govuk-body'>{t("ACCESSIBILITY_P_5")}</p>
                            <p className='govuk-body'>
                                <a href="https://mcmw.abilitynet.org.uk/">{t("ACCESSIBILITY_ANCHOR_1")}</a>
                                {t("ACCESSIBILITY_P_6")}
                            </p>
                            <h1 className="govuk-heading-l">
                                {t("ACCESSIBILITY_P_7")}
                            </h1>
                            <p className='govuk-body'>{t("ACCESSIBILITY_P_8")} <a href="">{t("ACCESSIBILITY_ANCHOR_2")}</a>.</p>
                            <p className='govuk-body'>{t("ACCESSIBILITY_P_9")}</p>
                            <ul className="govuk-list govuk-list--bullet">
                                {makeList(2, 27)}
                            </ul>
                            <h1 className="govuk-heading-l">
                                {t("ACCESSIBILITY_HEADING_4")}
                            </h1>
                            <p className='govuk-body'>{t("ACCESSIBILITY_P_10")}</p>
                            <h1 className="govuk-heading-l">
                                {t("ACCESSIBILITY_HEADING_5")}
                            </h1>
                            <p className='govuk-body'>{t("ACCESSIBILITY_P_11")}</p>
                            <h1 className="govuk-heading-l">
                                {t("ACCESSIBILITY_HEADING_6")}
                            </h1>
                            <p className='govuk-body'>{t("ACCESSIBILITY_P_12")}</p>
                            <h1 className="govuk-heading-l">
                                {t("ACCESSIBILITY_HEADING_7")}
                            </h1>
                            <p className='govuk-body'>{t("ACCESSIBILITY_P_13")}</p>
                            <p className='govuk-body'>{t("ACCESSIBILITY_P_14")}</p>
                            <p className='govuk-body'>
                                {t("ACCESSIBILITY_P_15")}
                                <a href=""></a>
                            </p>
                            <h1 className="govuk-heading-l">
                                {t("ACCESSIBILITY_HEADING_8")}
                            </h1>
                            <p className='govuk-body'>{t("ACCESSIBILITY_P_15")}</p>
                            <p className='govuk-body'>
                                {t("ACCESSIBILITY_P_16")}
                                <a href=""></a>
                                {t("ACCESSIBILITY_P_17")}
                            </p>
                            <ol className="govuk-list govuk-list--number">
                                {makeList(3, 27)}
                            </ol>
                            <h1 className="govuk-heading-l">
                                {t("ACCESSIBILITY_HEADING_9")}
                            </h1>
                            <p className='govuk-body'>{t("ACCESSIBILITY_P_18")}</p>
                            <p className='govuk-body'>
                                {t("ACCESSIBILITY_P_19")}
                                <a href=""></a>
                                {t("ACCESSIBILITY_P_20")}
                                {t("ACCESSIBILITY_P_21")}
                            </p>
                            <p className="govuk-body">
                                <a href="#" className="govuk-link" rel="noreferrer noopener" target="_blank">Is this page not working properly? (opens in new tab)</a>
                            </p>
                        </div>
                    </div>
                </main>
            </div>
            <LogoutPopup
                show={isSignoutModal}
                hideModal={() => setIsSignoutModal(false)}
                handleSignoutModal={signoutHandler}
                handleStaySignIn={() => setIsSignoutModal(true)}
            />
            <AppFooter links={linkContent}/>
        </>
    )
};

export default Accessibility;