import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ParsedHTML from '../../components/helpers/formatters/ParsedHtml';
import MainWrapper from '../../components/BaseComponents/MainWrapper';
import setPageTitle from '../../components/helpers/setPageTitleHelpers';
import useServiceShuttered from '../../components/helpers/hooks/useServiceShuttered';
import ShutterServicePage from '../../components/AppComponents/ShutterServicePage';
import { UnAuthNINOContext } from '../../components/helpers/HMRCAppContext';

declare const PCore: any;

const ConfirmationPage = ({ caseId }) => {
  const { t } = useTranslation();
  const [documentList, setDocumentList] = useState(``);
  const [documentListUA, setDocumentListUA] = useState(``);
  const [isBornAbroadOrAdopted, setIsBornAbroadOrAdopted] = useState(false);
  const [returnSlipContent, setReturnSlipContent] = useState();
  const [loading, setLoading] = useState(true);
  const serviceShuttered = useServiceShuttered();
  const { haveNINO } = useContext(UnAuthNINOContext);
  const caseIdNum = caseId.replace('HMRC-CHB-WORK ', '');
  const [caseIdPresent, setCaseIdPresent] = useState(false);
  const docIDForDocList = 'CR0003';
  const docIDForReturnSlip = 'CR0002';
  const docIDForDocListUA = 'CR0004';
  const locale = PCore.getEnvironmentInfo().locale.replaceAll('-', '_');

  useEffect(() => {
    setPageTitle();
  }, []);

  useEffect(() => {
    PCore.getDataPageUtils()
      .getPageDataAsync('D_DocumentContent', 'root', {
        DocumentID: docIDForDocList,
        Locale: locale,
        CaseID: caseId
      })
      .then(listData => {
        console.log('*** I am at conf page --- Doc content ', listData.DocumentContentHTML, ' ***');
        if (
          listData.DocumentContentHTML.includes("data-bornabroad='true'") ||
          listData.DocumentContentHTML.includes("data-adopted='true'")
        ) {
          setIsBornAbroadOrAdopted(true);
        }
        setLoading(false);
        setDocumentList(listData.DocumentContentHTML);
      })
      .catch(err => {
        // eslint-disable-next-line no-console
        console.log('*** I am at conf page doc content failed ***');
        console.error(err);
      });

    PCore.getDataPageUtils()
      .getPageDataAsync('D_DocumentContent', 'root', {
        DocumentID: docIDForDocListUA,
        Locale: locale,
        CaseID: caseId
      })
      .then(listData => {
        console.log(
          '*** I am at conf page --- Doc content UA',
          listData.DocumentContentHTML,
          ' ***'
        );
        setDocumentListUA(listData.DocumentContentHTML);
        if (listData.DocumentContentHTML.includes(caseIdNum)) {
          setCaseIdPresent(true);
          console.log('**********', caseIdPresent, '********', caseIdNum);
        }
        // if (
        //   listData.DocumentContentHTML.includes("")
        // ) {
        //   setIsBornAbroadOrAdopted(true);
        // }
        // setLoading(false);
        // setDocumentList(listData.DocumentContentHTML);
      })
      .catch(err => {
        // eslint-disable-next-line no-console
        console.log('*** I am at conf page doc content failed ***');
        console.error(err);
      });

    PCore.getDataPageUtils()
      .getPageDataAsync('D_DocumentContent', 'root', {
        DocumentID: docIDForReturnSlip,
        Locale: locale,
        CaseID: caseId
      })
      .then(pageData => {
        console.log(
          '*** I am at conf page --- Doc content return slip ',
          pageData.DocumentContentHTML,
          ' ***'
        );
        setReturnSlipContent(pageData.DocumentContentHTML);
      })
      .catch(err => {
        // eslint-disable-next-line no-console
        console.log('*** I am at conf page doc return slip failed ***');
        console.error(err);
      });
  }, []);

  const generateReturnSlip = e => {
    e.preventDefault();
    const myWindow = window.open('');
    myWindow.document.write(returnSlipContent);
  };

  if (loading) {
    return null;
  } else if (serviceShuttered) {
    return <ShutterServicePage />;
  } else if (!loading && isBornAbroadOrAdopted) {
    return (
      <MainWrapper>
        <div className='govuk-panel govuk-panel--confirmation govuk-!-margin-bottom-7'>
          <h1 className='govuk-panel__title'> {t('APPLICATION_RECEIVED')}</h1>
          {caseIdPresent && (
            <div className='govuk-panel__body'>
              {t('YOUR_REF_NUMBER')}
              <br></br>
              <strong>{caseId}</strong>
            </div>
          )}
          <div className='govuk-panel__body govuk-!-font-size-27'>
            {t('POST_YOUR_SUPPORTING_DOCUMENTS')}
          </div>
        </div>
        <h2 className='govuk-heading-m'> {t('WHAT_YOU_NEED_TO_DO_NOW')} </h2>
        <p className='govuk-body'> {t('THE_INFO_YOU_HAVE_PROVIDED')} </p>
        <ParsedHTML htmlString={documentList} />
        <p className='govuk-body'> {t('HMRC_MIGHT_CALL_YOU')} </p>
        <p className='govuk-body'>
          {' '}
          {t('AFTER_YOU_HAVE')}{' '}
          <a href='' onClick={e => generateReturnSlip(e)}>
            {t('PRINTED_AND_SIGNED_THE_FORM')} {t('OPENS_IN_NEW_TAB')}
          </a>
          , {t('RETURN_THE_FORM_WITH')}{' '}
        </p>
        <p className='govuk-body govuk-!-font-weight-bold'>
          Child Benefit Office (GB)
          <br />
          Washington
          <br />
          NEWCASTLE UPON TYNE
          <br />
          NE88 1ZD
        </p>
        <p className='govuk-body'> {t('WE_NORMALLY_RETURN_DOCUMENTS_WITHIN')} </p>
        <p className='govuk-body'>
          <a
            href='https://www.tax.service.gov.uk/feedback/ODXCHB'
            className='govuk-link'
            target='_blank'
            rel='noreferrer'
          >
            {t('WHAT_DID_YOU_THINK_OF_THIS_SERVICE')}{' '}
          </a>
          {t('TAKES_30_SECONDS')}
        </p>
      </MainWrapper>
    );
  } else {
    return (
      <MainWrapper>
        <div className='govuk-panel govuk-panel--confirmation govuk-!-margin-bottom-7'>
          <h1 className='govuk-panel__title'> {t('APPLICATION_RECEIVED')}</h1>
          {caseIdPresent && (
            <div className='govuk-panel__body'>
              {t('YOUR_REF_NUMBER')}
              <br></br>
              <strong>{caseId}</strong>
            </div>
          )}
        </div>
        <h2 className='govuk-heading-m'> {t('WHAT_HAPPENS_NEXT')}</h2>
        <p className='govuk-body'> {t('WE_HAVE_SENT_YOUR_APPLICATION')}</p>
        <p className='govuk-body'> {t('WE_WILL_TELL_YOU_IN_14_DAYS')}</p>
        <p className='govuk-body'>
          <a
            href='https://www.tax.service.gov.uk/feedback/ODXCHB'
            className='govuk-link'
            target='_blank'
            rel='noreferrer'
          >
            {t('WHAT_DID_YOU_THINK_OF_THIS_SERVICE')}{' '}
          </a>
          {t('TAKES_30_SECONDS')}
        </p>
      </MainWrapper>
    );
  }
};

export default ConfirmationPage;
