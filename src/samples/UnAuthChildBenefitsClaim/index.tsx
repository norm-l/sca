// @ts-nocheck - TypeScript type checking to be added soon
import React, { useState, useEffect } from 'react';
import { render } from 'react-dom';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { logout } from '@pega/react-sdk-components/lib/components/helpers/authManager';
import StoreContext from '@pega/react-sdk-components/lib/bridge/Context/StoreContext';
import createPConnectComponent from '@pega/react-sdk-components/lib/bridge/react_pconnect';

import {
  loginIfNecessary,
  sdkSetAuthHeader
} from '@pega/react-sdk-components/lib/components/helpers/authManager';

import { compareSdkPCoreVersions } from '@pega/react-sdk-components/lib/components/helpers/versionHelpers';
import { getSdkConfig } from '@pega/react-sdk-components/lib/components/helpers/config_access';
import AppHeader from '../../components/AppComponents/AppHeader';
import AppFooter from '../../components/AppComponents/AppFooter';
import ConfirmationPage from '../ChildBenefitsClaim/ConfirmationPage';
import setPageTitle from '../../components/helpers/setPageTitleHelpers';
import ServiceNotAvailable from '../../components/AppComponents/ServiceNotAvailable';

import { getSdkComponentMap } from '@pega/react-sdk-components/lib/bridge/helpers/sdk_component_map';
import localSdkComponentMap from '../../../sdk-local-component-map';
import { checkCookie, setCookie } from '../../components/helpers/cookie';
import ShutterServicePage from '../../components/AppComponents/ShutterServicePage';
import {
  initTimeout,
  staySignedIn,
  clearTimer
} from '../../components/AppComponents/TimeoutPopup/timeOutUtils';
import DeleteAnswers from './deleteAnswers';
import TimeoutPopup from '../../components/AppComponents/TimeoutPopup';
import toggleNotificationProcess from '../../components/helpers/toggleNotificationLanguage';

declare const myLoadMashup: Function;

export default function UnAuthChildBenefitsClaim() {
  const [pConn, setPConn] = useState<any>(null);
  const [bShowPega, setShowPega] = useState(true);
  const [showStartPage, setShowStartPage] = useState(true);
  const [bShowResolutionScreen, setShowResolutionScreen] = useState(false);
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const [serviceNotAvailable, setServiceNotAvailable] = useState(false);
  const [shutterServicePage, setShutterServicePage] = useState(false);
  const [hasSessionTimedOut, setHasSessionTimedOut] = useState(true);
  const [showDeletePage, setShowDeletePage] = useState(false);
  const [assignmentPConn, setAssignmentPConn] = useState(null);
  const history = useHistory();
  const [caseId, setCaseId] = useState('');

  // This needs to be changed in future when we handle the shutter for multiple service, for now this one's for single service
  const featureID = 'ChB';
  const featureType = 'Service';

  const { t } = useTranslation();

  function doRedirectDone() {
    history.push('/ua');
    // appName and mainRedirect params have to be same as earlier invocation
    loginIfNecessary({ appName: 'embedded', mainRedirect: true });
  }

  function resetAppDisplay() {
    setShowStartPage(false);
    setShowResolutionScreen(false);
    setServiceNotAvailable(false);
    setShowPega(false);
  }

  function getClaimsCaseID() {
    const context = PCore.getContainerUtils().getActiveContainerItemName(
      `${PCore.getConstants().APP.APP}/primary`
    );
    const caseID = PCore.getStoreValue('.ID', 'caseInfo', context);
    setCaseId(caseID);
  }

  function startNow() {
    // Check if PConn is created, and create case if it is
    if (pConn && !bShowPega) {
      resetAppDisplay();
      setShowPega(true);

      let startingFields = {};
      startingFields = {
        NotificationLanguage: sessionStorage.getItem('rsdk_locale')?.slice(0, 2) || 'en'
      };
      PCore.getMashupApi().createCase('HMRC-ChB-Work-Claim', PCore.getConstants().APP.APP, {
        startingFields
      });
    }
    setShowStartPage(false);
  }

  useEffect(() => {
    if (showStartPage) {
      startNow();
    }
  }, [showStartPage]);

  useEffect(() => {
    setPageTitle();
  }, [showStartPage, bShowPega, bShowResolutionScreen]);

  function closeContainer() {
    PCore.getContainerUtils().closeContainerItem(
      PCore.getContainerUtils().getActiveContainerItemContext('app/primary'),
      { skipDirtyCheck: true }
    );
    setShowPega(false);
  }

  // TODO - this function will have its pega counterpart for the feature to be completed - part of future story
  function deleteData() {
    const activeContainer = PCore.getContainerUtils().getActiveContainerItemContext('app/primary');
    if (bShowPega && activeContainer) {
      PCore.getContainerUtils().closeContainerItem(
        PCore.getContainerUtils().getActiveContainerItemContext('app/primary'),
        { skipDirtyCheck: true }
      );
    }

    setShowTimeoutModal(false);
    setShowStartPage(false);
    setShowPega(false);
    setShowResolutionScreen(false);
    setShowDeletePage(true);
  }

  function returnToPortalPage() {
    staySignedIn(setShowTimeoutModal, false);
    resetAppDisplay();
    setShowStartPage(true);
    closeContainer();
  }

  function assignmentFinished() {
    getClaimsCaseID();
    closeContainer();
    resetAppDisplay();
    setShowResolutionScreen(true);
  }
  function cancelAssignment() {
    closeContainer();
    resetAppDisplay();
    setShowStartPage(true);
  }

  function establishPCoreSubscriptions() {
    PCore.getPubSubUtils().subscribe(
      PCore.getConstants().PUB_SUB_EVENTS.CASE_EVENTS.END_OF_ASSIGNMENT_PROCESSING,
      () => {
        assignmentFinished();
      },
      'assignmentFinished'
    );
    PCore.getPubSubUtils().subscribe(
      'assignmentFinished',
      () => {
        setShowStartPage(false);
        setShowPega(false);
        const containername = PCore.getContainerUtils().getActiveContainerItemName(
          `${PCore.getConstants().APP.APP}/primary`
        );
        const context = PCore.getContainerUtils().getActiveContainerItemName(
          `${containername}/workarea`
        );
        const status = PCore.getStoreValue('.pyStatusWork', 'caseInfo.content', context);
        if (status === 'Resolved-Discarded') {
          setServiceNotAvailable(true);
          PCore.getContainerUtils().closeContainerItem(context);
        }
      },
      'assignmentFinished'
    );

    PCore.getPubSubUtils().subscribe(
      PCore.getConstants().PUB_SUB_EVENTS.EVENT_CANCEL,
      () => {
        cancelAssignment();
      },
      'cancelAssignment'
    );

    PCore.getPubSubUtils().subscribe(
      PCore.getConstants().PUB_SUB_EVENTS.CONTAINER_EVENTS.CLOSE_CONTAINER_ITEM,
      () => {
        resetAppDisplay();
      },
      'closeContainer'
    );

    PCore.getPubSubUtils().subscribe(
      PCore.getConstants().PUB_SUB_EVENTS.CASE_EVENTS.ASSIGNMENT_OPENED,
      () => {
        resetAppDisplay();
        setShowPega(true);
      },
      'continueAssignment'
    );

    PCore.getPubSubUtils().subscribe(
      PCore.getConstants().PUB_SUB_EVENTS.CASE_EVENTS.CASE_CREATED,
      () => {
        resetAppDisplay();
        setShowPega(true);
      },
      'continueCase'
    );

    PCore.getPubSubUtils().subscribe(
      PCore.getConstants().PUB_SUB_EVENTS.CASE_EVENTS.CREATE_STAGE_SAVED,
      () => {
        cancelAssignment();
      },
      'savedCase'
    );

    PCore.getPubSubUtils().subscribe(
      PCore.getConstants().PUB_SUB_EVENTS.CASE_EVENTS.CASE_OPENED,
      () => {
        resetAppDisplay();
        setShowPega(true);
      },
      'continueCase'
    );
  }

  function RootComponent(props) {
    const PegaConnectObj = createPConnectComponent();
    const thePConnObj = <PegaConnectObj {...props} />;

    const theComp = (
      <StoreContext.Provider
        value={{
          store: PCore.getStore(),
          displayOnlyFA: true,
          isMashup: true,
          setAssignmentPConnect: setAssignmentPConn
        }}
      >
        {thePConnObj}
      </StoreContext.Provider>
    );

    return theComp;
  }

  /**
   * Callback from onPCoreReady that's called once the top-level render object
   * is ready to be rendered
   * @param inRenderObj the initial, top-level PConnect object to render
   */
  function initialRender(inRenderObj) {
    // loadMashup does its own thing so we don't need to do much/anything here
    // // modified from react_root.js render
    const {
      props,
      domContainerID = null,
      componentName,
      portalTarget,
      styleSheetTarget
    } = inRenderObj;

    const thePConn = props.getPConnect();

    setPConn(thePConn);

    let target: any = null;

    if (domContainerID !== null) {
      target = document.getElementById(domContainerID);
    } else if (portalTarget !== null) {
      target = portalTarget;
    }

    // Note: RootComponent is just a function (declared below)
    const Component: any = RootComponent;

    if (componentName) {
      Component.displayName = componentName;
    }

    const theComponent = (
      <Component {...props} portalTarget={portalTarget} styleSheetTarget={styleSheetTarget} />
    );

    // Initial render of component passed in (which should be a RootContainer)
    render(<React.Fragment>{theComponent}</React.Fragment>, target);
  }

  /**
   * kick off the application's portal that we're trying to serve up
   */
  function startMashup() {
    // NOTE: When loadMashup is complete, this will be called.
    PCore.onPCoreReady(renderObj => {
      // Check that we're seeing the PCore version we expect
      compareSdkPCoreVersions();
      establishPCoreSubscriptions();

      initTimeout(showTimeoutModal, deleteData, false);

      // Subscribe to any store change to reset timeout counter
      PCore.getStore().subscribe(() => staySignedIn(setShowTimeoutModal, deleteData, false));

      // TODO : Consider refactoring 'en_GB' reference as this may need to be set elsewhere
      PCore.getEnvironmentInfo().setLocale(sessionStorage.getItem('rsdk_locale') || 'en_GB');
      PCore.getLocaleUtils().resetLocaleStore();
      PCore.getLocaleUtils().loadLocaleResources([
        PCore.getLocaleUtils().GENERIC_BUNDLE_KEY,
        '@BASECLASS!DATAPAGE!D_LISTREFERENCEDATABYTYPE'
      ]);
      initialRender(renderObj);

      /* Functionality to set the device id in the header for use in CIP.
      Device id is unique and will be stored on the user device / browser cookie */
    });

    // Initialize the SdkComponentMap (local and pega-provided)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
    getSdkComponentMap(localSdkComponentMap).then((theComponentMap: any) => {
      // eslint-disable-next-line no-console
      console.log(`SdkComponentMap initialized`);
    });
    PCore.getDataPageUtils()
      .getPageDataAsync('D_ShutterLookup', 'root', {
        FeatureID: featureID,
        FeatureType: featureType
      })
      .then(resp => {
        const isShuttered = resp.Shuttered;
        if (isShuttered) {
          resetAppDisplay();
          setShutterServicePage(true);
        } else {
          setShutterServicePage(false);
          resetAppDisplay();
          setShowStartPage(true);
        }
      })
      .catch(err => {
        // eslint-disable-next-line no-console
        console.error(err);
      });

    // load the Mashup and handle the onPCoreEntry response that establishes the
    //  top level Pega root element (likely a RootContainer)

    myLoadMashup('pega-root', false); // this is defined in bootstrap shell that's been loaded already
  }

  function setIdsInHeaders(deviceID, externalID) {
    setCookie('pegaodxdi', deviceID, 3650);
    setCookie('pegaodxei', externalID, 3650);
    const isDeviceIdSet = PCore.getRestClient()
      .getHeaderProcessor()
      .registerHeader('deviceid', deviceID);
    const isExternalIdSet = PCore.getRestClient()
      .getHeaderProcessor()
      .registerHeader('externalid', externalID);
    if (isDeviceIdSet && isExternalIdSet) {
      // start the portal
      startMashup();
    }
  }

  function fetchingIDsForHeader() {
    let deviceID = checkCookie('pegaodxdi');
    let externalID = checkCookie('pegaodxei');
    if (deviceID && externalID) {
      setIdsInHeaders(deviceID, externalID);
    } else {
      PCore.getDataPageUtils()
        .getPageDataAsync('D_UserSession', 'root')
        .then(res => {
          deviceID = res.DeviceId;
          externalID = res.ExternalId;
          setIdsInHeaders(deviceID, externalID);
        });
    }
  }

  // One time (initialization) subscriptions and related unsubscribe
  useEffect(() => {
    getSdkConfig().then(sdkConfig => {
      const sdkConfigAuth = sdkConfig.authConfig;
      sdkConfigAuth.authService = sdkConfigAuth.uAuthService;

      if (!sdkConfigAuth.mashupClientId && sdkConfigAuth.customAuthType === 'Basic') {
        // Service package to use custom auth with Basic
        const sB64 = window.btoa(
          `${sdkConfigAuth.mashupUserIdentifier}:${window.atob(sdkConfigAuth.mashupPassword)}`
        );
        sdkSetAuthHeader(`Basic ${sB64}`);
      }

      if (!sdkConfigAuth.mashupClientId && sdkConfigAuth.customAuthType === 'BasicTO') {
        const now = new Date();
        const expTime = new Date(now.getTime() + 5 * 60 * 1000);
        let sISOTime = `${expTime.toISOString().split('.')[0]}Z`;
        const regex = /[-:]/g;
        sISOTime = sISOTime.replace(regex, '');
        // Service package to use custom auth with Basic
        const sB64 = window.btoa(
          `${sdkConfigAuth.mashupUserIdentifier}:${window.atob(
            sdkConfigAuth.mashupPassword
          )}:${sISOTime}`
        );
        sdkSetAuthHeader(`Basic ${sB64}`);
      }
      // Login if needed, without doing an initial main window redirect
      loginIfNecessary({ appName: 'embedded', mainRedirect: true, redirectDoneCB: doRedirectDone });
    });

    document.addEventListener('SdkConstellationReady', () => {
      // ready the header and call startMashup()
      fetchingIDsForHeader();
    });

    document.addEventListener('SdkLoggedOut', () => {
      window.location.href = 'https://www.gov.uk/government/organisations/hm-revenue-customs';
    });

    // Subscriptions can't be done until onPCoreReady.
    // So we subscribe there. But unsubscribe when this
    // component is unmounted (in function returned from this effect)

    return function cleanupSubscriptions() {
      PCore?.getPubSubUtils().unsubscribe(
        PCore.getConstants().PUB_SUB_EVENTS.EVENT_CANCEL,
        'cancelAssignment'
      );
      PCore?.getPubSubUtils().unsubscribe(
        PCore.getConstants().PUB_SUB_EVENTS.ASSIGNMENT_OPENED,
        'continueAssignment'
      );
      PCore?.getPubSubUtils().unsubscribe(
        PCore.getConstants().PUB_SUB_EVENTS.CASE_OPENED,
        'continueCase'
      );

      PCore?.getPubSubUtils().unsubscribe('closeContainer');
      PCore?.getPubSubUtils().unsubscribe(
        PCore.getConstants().PUB_SUB_EVENTS.CASE_EVENTS.END_OF_ASSIGNMENT_PROCESSING,
        'assignmentFinished'
      );
    };
  }, []);

  return (
    <>
      <AppHeader
        appname={t('CLAIM_CHILD_BENEFIT')}
        hasLanguageToggle
        isPegaApp={bShowPega}
        languageToggleCallback={toggleNotificationProcess(
          { en: 'SwitchLanguageToEnglish', cy: 'SwitchLanguageToWelsh' },
          assignmentPConn
        )}
      />

      <div className='govuk-width-container'>
        <div id='pega-part-of-page'>
          <div id='pega-root'></div>
        </div>
        {shutterServicePage && <ShutterServicePage />}

        {serviceNotAvailable && <ServiceNotAvailable returnToPortalPage={returnToPortalPage} />}
        {showDeletePage && <DeleteAnswers hasSessionTimedOut={hasSessionTimedOut} />}
        {bShowResolutionScreen && <ConfirmationPage caseId={caseId} isUnAuth />}
        {!showDeletePage && (
          <TimeoutPopup
            show={showTimeoutModal}
            staySignedinHandler={() => {
              staySignedIn(setShowTimeoutModal, deleteData, false, bShowResolutionScreen);
            }}
            signoutHandler={() => {
              if (bShowResolutionScreen) {
                logout();
              } else {
                clearTimer();
                deleteData();

                setHasSessionTimedOut(false);
              }
            }}
            isAuthorised={false}
            isConfirmationPage={bShowResolutionScreen}
          />
        )}
        {/** No Log out popup required as one isn't logged in */}
      </div>

      <AppFooter />
    </>
  );
}
