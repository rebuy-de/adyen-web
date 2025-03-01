const path = require('path');
require('dotenv').config({ path: path.resolve('../../', '.env') });

import { Selector, RequestMock } from 'testcafe';
import { start, getIframeSelector, getIsValid } from '../../../../utils/commonUtils';
import cu from '../../../utils/cardUtils';
import { BASE_URL, CARDS_URL } from '../../../../pages';
import { BIN_LOOKUP_VERSION, TEST_CVC_VALUE, UNKNOWN_BIN_CARD } from '../../../utils/constants';

const brandingIcon = Selector('.card-field .adyen-checkout__card__cardNumber__brandIcon');

const dateSpan = Selector('.card-field .adyen-checkout__card__exp-date__input');

const requestURL = `https://checkoutshopper-test.adyen.com/checkoutshopper/${BIN_LOOKUP_VERSION}/bin/binLookup?token=${process.env.CLIENT_KEY}`;

/**
 * NOTE - we are mocking the response until such time as we have a genuine card,
 * that's not in our local RegEx, that returns the properties we want to test
 */
const mockedResponse = {
    brands: [
        {
            brand: 'bcmc', // keep as a recognised card brand (bcmc) until we have a genuine plcc - to avoid logo loading errors
            cvcPolicy: 'required',
            enableLuhnCheck: true,
            showExpiryDate: false,
            supported: true
        }
    ],
    issuingCountryCode: 'US',
    requestId: null
};

const mock = RequestMock()
    .onRequestTo(request => {
        return request.url === requestURL && request.method === 'post';
    })
    .respond(
        (req, res) => {
            const body = JSON.parse(req.body);
            mockedResponse.requestId = body.requestId;
            res.setBody(mockedResponse);
        },
        200,
        {
            'Access-Control-Allow-Origin': BASE_URL
        }
    );

const TEST_SPEED = 1;

const iframeSelector = getIframeSelector('.card-field iframe');

const cardUtils = cu(iframeSelector);

fixture`Testing a PLCC, as detected by a mock/binLookup, for a response that should indicate hidden expiryDate field)`
    .page(CARDS_URL)
    .clientScripts('plcc.clientScripts.js')
    .requestHooks(mock);

test('Test plcc card hides date field ' + 'then complete date and see card is valid ' + ' then delete card number and see card reset', async t => {
    // Start, allow time for iframes to load
    await start(t, 2000, TEST_SPEED);

    // Generic card
    await t.expect(brandingIcon.getAttribute('src')).contains('nocard.svg');

    // Unknown card
    await cardUtils.fillCardNumber(t, UNKNOWN_BIN_CARD);

    await t
        // bcmc card icon
        .expect(brandingIcon.getAttribute('src'))
        .contains('bcmc.svg')

        // hidden date field
        .expect(dateSpan.filterHidden().exists)
        .ok();

    // Is not valid
    await t.expect(getIsValid('card')).eql(false);

    // Fill cvc
    await cardUtils.fillCVC(t, TEST_CVC_VALUE);

    // Is valid
    await t.expect(getIsValid('card')).eql(true);

    // Delete number
    await cardUtils.deleteCardNumber(t);

    // Card is reset
    await t
        // generic card icon
        .expect(brandingIcon.getAttribute('src'))
        .contains('nocard.svg')

        // visible date field
        .expect(dateSpan.filterVisible().exists)
        .ok();

    await t.expect(getIsValid('card')).eql(false);
});
