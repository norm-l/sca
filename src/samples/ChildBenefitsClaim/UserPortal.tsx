import React, { useEffect } from 'react';
import Button from '../../components/BaseComponents/Button/Button';
import { useTranslation } from 'react-i18next';
import useHMRCExternalLinks from '../../components/helpers/hooks/HMRCExternalLinks';
import setPageTitle from '../../components/helpers/setPageTitleHelpers';
import NotificationBanner from '../../components/BaseComponents/NotificationBanner/NotificationBanner';

export default function UserPortal(props) {
  const {
    beginClaim,
    children,
    showPortalBanner,
    showBeginNewClaimButton,
    beginNewClaimButtonForInProgressClaims
  } = props;
  const { t } = useTranslation();
  const { referrerURL, hmrcURL } = useHMRCExternalLinks();

  useEffect(() => {
    setPageTitle();
    sessionStorage.setItem('isTasklistScreen', 'false');
  }, []);

  return (
    <>
      <main className='govuk-main-wrapper' id='main-content' role='main'>
        {showPortalBanner && (
          <NotificationBanner content={t('PORTAL_NOTIFICATION_BANNER_CONTENT')} />
        )}
        <div className='govuk-grid-row'>
          <div className='govuk-grid-column-two-thirds'>
            <h1 className='govuk-heading-l'>{t('YOUR_CLAIM_APPLICATIONS')}</h1>
          </div>
        </div>
        <div className='govuk-grid-row'>
          <div className='govuk-grid-column-full govuk-prototype-kit-common-templates-mainstream-guide-body'>
            <p className='govuk-body'>{t('THIS_PAGE_SHOWS')}</p>
            <ul className='govuk-list govuk-list--bullet'>
              <li>
                <span className='govuk-body'>{t('CLAIMS_THAT_ARE_IN_PROGRESS')}</span>
              </li>
              <li>
                <span className='govuk-body'>{t('CLAIMS_THAT_ARE_SUBMITTED')}</span>
              </li>
            </ul>
            <hr
              className='govuk-section-break govuk-section-break--xl govuk-section-break--visible'
              aria-hidden
            ></hr>

            {/* Claims list */}
            <div className='govuk-grid-column-two-thirds'>
              <>{children}</>
              <>
                <h2 className='govuk-heading-m' id='subsection-title'>
                  {t('MAKE_A_CLAIM')}
                </h2>
                {(() => {
                  if (showBeginNewClaimButton && beginNewClaimButtonForInProgressClaims) {
                    return (
                      <>
                        <div className='govuk-warning-text'>
                          <span className='govuk-warning-text__icon' aria-hidden='true'>
                            !
                          </span>
                          <strong className='govuk-warning-text__text'>
                            <span className='govuk-visually-hidden'>{t('WARNING')}</span>
                            {t('MAKE_A_CLAIM_AFTER_24_HRS')}
                          </strong>
                        </div>

                        <>
                          <p className='govuk-body'>{t('HAVE_EXISTING_CLAIM_IN_PROGRESS')}</p>
                          <p className='govuk-body'>{t('CANNOT_START_A_NEW_CLAIM')}</p>
                          <p className='govuk-body'>{t('WE_MAY_CALL_YOU')}</p>
                        </>
                      </>
                    );
                  } else if (showBeginNewClaimButton) {
                    return (
                      <div className='govuk-warning-text'>
                        <span className='govuk-warning-text__icon' aria-hidden='true'>
                          !
                        </span>
                        <strong className='govuk-warning-text__text'>
                          <span className='govuk-visually-hidden'>{t('WARNING')}</span>
                          {t('MAKE_A_CLAIM_AFTER_24_HRS')}
                        </strong>
                      </div>
                    );
                  } else if (beginNewClaimButtonForInProgressClaims) {
                    return (
                      <>
                        <p className='govuk-body'>{t('HAVE_EXISTING_CLAIM_IN_PROGRESS')}</p>
                        <p className='govuk-body'>{t('CANNOT_START_A_NEW_CLAIM')}</p>
                        <p className='govuk-body'>{t('WE_MAY_CALL_YOU')}</p>
                      </>
                    );
                  } else {
                    return (
                      <>
                        <p className='govuk-body'>{t('USE_THIS_SERVICE')}</p>
                        <p className='govuk-body'>{t('WE_MAY_CALL_YOU')}</p>
                        <Button
                          attributes={{ className: 'govuk' }}
                          onClick={beginClaim}
                          variant='start'
                        >
                          {t('BEGIN_NEW_CLAIM')}
                        </Button>
                      </>
                    );
                  }
                })()}
              </>
              <>
                <h2 className='govuk-heading-m' id='subsection-title'>
                  {t('ONLINE')}
                </h2>
                <p className='govuk-body'>
                  <a
                    href='https://www.tax.service.gov.uk/ask-hmrc/chat/child-benefit'
                    className='govuk-link'
                    rel='noreferrer noopener'
                    target='_blank'
                  >
                    {t('ASK_HMRC_ONLINE')} {t('OPENS_IN_NEW_TAB')}
                  </a>
                </p>
                <p className='govuk-body'>{t('ASK_HMRC_DIGITAL')}</p>
                <ul className='govuk-list govuk-list--bullet'>
                  <li>
                    <span className='govuk-body'>{t('CLAIMING_CHILD_BENEFIT')}</span>
                  </li>
                  <li>
                    <span className='govuk-body'>{t('THE_HIGH_INCOME_CHB_TAX_CHARGE')}</span>
                  </li>
                  <li>
                    <span className='govuk-body'>{t('ANY_CHANGE_OF_CIRCUMSTANCE')}</span>
                  </li>
                </ul>
                <br />
                <a
                  lang='en'
                  className='govuk-link hmrc-report-technical-issue '
                  rel='noreferrer noopener'
                  target='_blank'
                  href={`${hmrcURL}contact/report-technical-problem?newTab=true&service=463&referrerUrl=${referrerURL}`}
                >
                  {t('PAGE_NOT_WORKING_PROPERLY')} {t('OPENS_IN_NEW_TAB')}
                </a>
              </>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
