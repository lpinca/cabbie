// @flow

import type {Driver} from 'cabbie-async';
import {getSessions, getStatus, MouseButtons, SelectorTypes} from 'cabbie-async';
import chalk from 'chalk';
import assert from 'assert';

async function test(name: string, fn: () => Promise<void>) {
  console.log(chalk.blue(name));
  await fn();
}

async function run(driver: Driver, location: string) {
  async function checkText(elementSelector: string, expectedText: string) {
    const element = await driver.activeWindow.getElement(elementSelector);
    const actualText = await element.getText();
    assert.equal(actualText, expectedText);
    return element;
  }

  await test('test timeouts', async () => {
    await driver.timeOut.setTimeOuts({implicit: '1s', async: '10s'});
  });

  await test('get the active window handle', async () => {
    const activeWindowHandle = await driver.activeWindow.getWindowHandle();
    assert.notEqual(activeWindowHandle.id, 'current');
    assert.equal(typeof activeWindowHandle.id, 'string');
  });

  await test('navigate to a domain', async () => {
    await driver.activeWindow.navigateTo(location);
  });

  await test('get the url of the active window', async () => {
    assert.equal(await driver.activeWindow.getUrl(), location);
  });

  await test('select a single element', async () => {
    const alertButton = await driver.activeWindow.getElement('#alert_button');
    assert(alertButton && typeof alertButton === 'object');
  });

  // this is very slow:
  // await test('selecting an element that does not exist throws an exception', async () => {
  //   try {
  //     await driver.activeWindow.getElement('#does_not_exist');
  //   } catch (ex) {
  //     assert.equal(ex.code, 'NoSuchElement');
  //     return;
  //   }
  //   assert(false, 'Expected getting a non-existent element to throw an error');
  // });

  await test('selecting an element that does not exist throws an exception', async () => {
    assert(
      null === (await driver.activeWindow.tryGetElement('#does_not_exist')),
      'Expected getting a non-existent element to return null',
    );
  });

  await test("select a single element's id", async () => {
    const alertButton = await driver.activeWindow.getElement('#alert_button');
    const elementID = alertButton.elementID;
    assert(elementID.length > 0);
  });

  await test('select a single element by name', async () => {
    const element = await driver.activeWindow.getElement('q', SelectorTypes.NAME);
    assert(element);
  });

  await test('select a single element by id and check tag name', async () => {
    const inputField = await driver.activeWindow.getElement('inputField', SelectorTypes.ID);
    assert.equal(await inputField.getTagName(), 'input');
  });

  await test('get the computed css value of a single element', async () => {
    const areaToClick = await driver.activeWindow.getElement('#areaToClick');
    assert.equal(await areaToClick.getCssValue('width'), '500px');
  });

  await test('check an element class existence', async () => {
    const inputField = await driver.activeWindow.getElement('#inputField');
    assert(await inputField.hasClass('hasThisClass'));
    assert(await inputField.hasClass('andAnotherClass'));
    assert(!await inputField.hasClass('doesNotHaveClass'));
  });

  await test('compare elements', async () => {
    const inputField = await driver.activeWindow.getElement('#inputField');
    const confirmButton = await driver.activeWindow.getElement('#confirm_button');
    assert(!await inputField.isEqual(confirmButton));
    assert(!await confirmButton.isEqual(inputField));

    const inputFieldByClass = await driver.activeWindow.getElement('hasThisClass', SelectorTypes.CLASS);
    assert(await inputField.isEqual(inputFieldByClass));
    assert(await inputFieldByClass.isEqual(inputField));
  });

  await test('check if an element is enabled', async () => {
    const firstCheckBox = await driver.activeWindow.getElement('#firstCheckBox');
    assert(await firstCheckBox.isEnabled());
    assert(!await firstCheckBox.isDisabled());

    const thirdCheckBox = await driver.activeWindow.getElement('#thirdCheckBox');
    assert(!await thirdCheckBox.isEnabled());
    assert(await thirdCheckBox.isDisabled());
  });

  await test('check if an item is selected', async () => {
    const firstCheckBox = await driver.activeWindow.getElement('#firstCheckBox');
    assert(await firstCheckBox.isSelected());

    const secondCheckBox = await driver.activeWindow.getElement('#secondCheckBox');
    assert(!await secondCheckBox.isSelected());
  });

  await test('submit a form', async () => {
    const formToSubmit = await driver.activeWindow.getElement('#formToSubmit');
    await formToSubmit.submit();
    const url = await driver.activeWindow.getUrl();
    assert.equal(url.substr(-7), '?q=1357');
  });

  await test('click on an element', async () => {
    const areaToClick = await driver.activeWindow.getElement('#areaToClick');
    await areaToClick.mouse.click();
    assert.equal(await areaToClick.getText(), 'clicked left at 450x75');
  });

  await test('click on an element with right button', async () => {
    const areaToClick = await driver.activeWindow.getElement('#areaToClick');
    await areaToClick.mouse.click(MouseButtons.RIGHT);
    assert.equal(await areaToClick.getText(), 'clicked right');
  });

  // N.B. we do not test middle click, because it causes the build to fail on a mac
  await test('click on an element at a specific place', async () => {
    const areaToClick = await driver.activeWindow.getElement('#areaToClick');
    await areaToClick.mouse.clickAt(14, 17);
    assert.equal(await areaToClick.getText(), 'clicked left at 214x67');
  });

  await test('double-click on an element', async () => {
    const areaToClick = await driver.activeWindow.getElement('#areaToClick');
    await areaToClick.mouse.doubleClick();
    assert.equal(await areaToClick.getText(), 'double clicked left at 450x75');
  });

  await test('double-click on an element at a specific place', async () => {
    const areaToClick = await driver.activeWindow.getElement('#areaToClick');
    await areaToClick.mouse.doubleClickAt(14, 17);
    assert.equal(await areaToClick.getText(), 'double clicked left at 214x67');
  });

  await test('click down on an element', async () => {
    const areaToClick = await driver.activeWindow.getElement('#areaToClick');
    await areaToClick.mouse.buttonDownAt(13, 16);
    await areaToClick.mouse.buttonUpAt(13, 16);
    assert.equal(await areaToClick.getText(), 'clicked left at 213x66');
  });
  await test('click up on an element', async () => {
    const areaToClick = await driver.activeWindow.getElement('#areaToClick');
    await areaToClick.mouse.buttonDownAt(88, 32);
    await areaToClick.mouse.buttonUpAt(88, 32);
    assert.equal(await areaToClick.getText(), 'clicked left at 288x82');
  });

  await test('click down and up on an element', async () => {
    const areaToClick = await driver.activeWindow.getElement('#areaToClick');
    await areaToClick.mouse.buttonDown();
    await areaToClick.mouse.buttonUp();
    assert.equal(await areaToClick.getText(), 'clicked left at 450x75');
  });

  await test('get the size of an element', async () => {
    const inputField = await driver.activeWindow.getElement('#inputField');
    const size = await inputField.getSize();
    assert.equal(typeof size, 'object');
    assert(size.hasOwnProperty('width'));
    assert(size.hasOwnProperty('height'));
  });

  await test('get the position of an element', async () => {
    const inputField = await driver.activeWindow.getElement('#inputField');
    const position = await inputField.getPosition();
    assert.equal(typeof position, 'object');
    assert(position.hasOwnProperty('x'));
    assert(position.hasOwnProperty('y'));
  });

  await test('get the frame of an element', async () => {
    const inputField = await driver.activeWindow.getElement('#inputField');
    const frame = await inputField.getFrame();
    assert.equal(typeof frame, 'object');
    assert(frame.hasOwnProperty('x'));
    assert(frame.hasOwnProperty('y'));
    assert(frame.hasOwnProperty('width'));
    assert(frame.hasOwnProperty('height'));
  });

  await test('get the absolute-center of an element', async () => {
    const inputField = await driver.activeWindow.getElement('#inputField');
    const center = await inputField.getAbsoluteCenter();
    assert.equal(typeof center, 'object');
    assert(center.hasOwnProperty('x'));
    assert(center.hasOwnProperty('y'));
  });

  await test('get the relative-center of an element', async () => {
    const inputField = await driver.activeWindow.getElement('#inputField');
    const center = await inputField.getRelativeCenter();
    assert.equal(typeof center, 'object');
    assert(center.hasOwnProperty('x'));
    assert(center.hasOwnProperty('y'));
  });

  await test('select multiple elements', async () => {
    const elements = await driver.activeWindow.getElements('.class-selectable');
    assert.equal(elements.length, 2);
  });

  await test('check if element exist', async () => {
    assert(await driver.activeWindow.hasElement('.class-selectable'));
    assert(!await driver.activeWindow.hasElement('.class2-selectable'));
  });

  await test('get a sub-element from a context', async () => {
    const container = await driver.activeWindow.getElement('#container');
    const subElement = await container.getElement('#sub-element');
    assert.equal(await subElement.getText(), 'Sub-Element');
    const subElement2 = await container.getElement('.someSubElement');
    assert.equal(await subElement2.getText(), 'Some Sub-Element');
  });

  await test('get multiple sub-elements from a context', async () => {
    const container = await driver.activeWindow.getElement('#container');
    const subElements = await container.getElements('div');
    assert(Array.isArray(subElements));
    assert.equal(subElements.length, 2);
  });

  await test('check if sub-elements exist', async () => {
    const container = await driver.activeWindow.getElement('#container');
    assert(await container.hasElement('.someSubElement'));
    assert(!await container.hasElement('.somenNonExistentSubElement'));
  });

  await test('get the active element', async () => {
    const element = await driver.activeWindow.getActiveElement();
    assert(element && typeof element === 'object');
  });

  await test('get the title of the active window', async () => {
    assert.equal(await driver.activeWindow.getTitle(), 'Test Page');
  });

  await test('get the source-code of the active window', async () => {
    const source = await driver.activeWindow.getSource();
    assert(source.includes('<!DOCTYPE html>'));
  });

  await test('click on a link', async () => {
    const linkToClick = await driver.activeWindow.getElement('#linkToClick');
    await linkToClick.mouse.click();
    assert.equal(await driver.activeWindow.getTitle(), 'Linked Page');
  });

  await test('send keys to the active window', async () => {
    await driver.activeWindow.sendKeys('a');
    const typeKeyPress = await driver.activeWindow.getElement('#typeKeyPress');
    assert.equal(await typeKeyPress.getText(), 'KeyPress:97');
    const typeKeyUp = await await driver.activeWindow.getElement('#typeKeyUp');
    assert.equal(await typeKeyUp.getText(), 'KeyUp:65');
    await driver.activeWindow.sendKeys(['a', 'b']);
    assert.equal(await typeKeyPress.getText(), 'KeyPress:98');
    assert.equal(await typeKeyUp.getText(), 'KeyUp:66');
    const typeKeyDown = await driver.activeWindow.getElement('#typeKeyDown');
    assert.equal(await typeKeyDown.getText(), 'KeyDown:66');
  });

  await test('go backward', async () => {
    await driver.activeWindow.goBackward();
  });

  await test('go forward', async () => {
    await driver.activeWindow.goForward();
    await driver.activeWindow.goBackward();
  });

  await test('refresh', async () => {
    await driver.activeWindow.refresh();
  });

  await test('accept an alert', async () => {
    const alertButton = await driver.activeWindow.getElement('#alert_button');
    await alertButton.mouse.click();
    assert.equal(await driver.activeWindow.alert.getText(), 'This is a test alert!');
    await driver.activeWindow.alert.accept();
    assert.equal(await alertButton.getText(), 'alerted');
  });

  await test('accept a confirm', async () => {
    const confirmButton = await driver.activeWindow.getElement('#confirm_button');
    await confirmButton.mouse.click();
    assert.equal(await driver.activeWindow.alert.getText(), 'Test confirmation');
    await driver.activeWindow.alert.accept();
    assert.equal(await confirmButton.getText(), 'confirmed');
  });

  await test('dismiss a confirm', async () => {
    const confirmButton = await driver.activeWindow.getElement('#confirm_button');
    await confirmButton.mouse.click();
    assert.equal(await driver.activeWindow.alert.getText(), 'Test confirmation');
    await driver.activeWindow.alert.dismiss();
    assert.equal(await confirmButton.getText(), 'denied');
  });

  await test('accept a prompt with default value', async () => {
    const promptButton = await driver.activeWindow.getElement('#prompt_button');
    await promptButton.mouse.click();
    assert.equal(await driver.activeWindow.alert.getText(), 'Test Prompt:');
    await driver.activeWindow.alert.accept();
    assert.equal(await promptButton.getText(), 'prompted: default value');
  });

  await test('accept a prompt with custom value', async () => {
    const promptButton = await driver.activeWindow.getElement('#prompt_button');
    await promptButton.mouse.click();
    assert.equal(await driver.activeWindow.alert.getText(), 'Test Prompt:');
    await driver.activeWindow.alert.setText('Works!');
    await driver.activeWindow.alert.accept();
    assert.equal(await promptButton.getText(), 'prompted: Works!');
  });

  await test('dismiss a prompt', async () => {
    const promptButton = await driver.activeWindow.getElement('#prompt_button');
    await promptButton.mouse.click();
    assert.equal(await driver.activeWindow.alert.getText(), 'Test Prompt:');
    await driver.activeWindow.alert.dismiss();
    assert.equal(await promptButton.getText(), 'prompted: null');
  });

  await test('execute javascript code as string', async () => {
    await driver.activeWindow.execute("alert('test-32');");
    assert.equal(await driver.activeWindow.alert.getText(), 'test-32');
    await driver.activeWindow.alert.accept();
  });

  // This test does not play well with snapshots:
  // await test('execute javascript code as a function', async () => {
  //   await driver.activeWindow.execute(function() {
  //     alert('test-33');
  //   });
  //   assert.equal(await driver.activeWindow.alert.getText(), 'test-33');
  //   await driver.activeWindow.alert.accept();
  // });
  await test('execute javascript code as a function with parameters', async () => {
    const alertButtonText = await driver.activeWindow.execute(
      'return document.getElementById(arguments[0]).textContent;',
      ['alert_button'],
    );
    assert.equal(alertButtonText, 'alerted');
  });

  await test('execute asynchronous javascript code', async () => {
    await driver.activeWindow.asyncExecute("alert('test-35');");
    assert.equal(await driver.activeWindow.alert.getText(), 'test-35');
    await driver.activeWindow.alert.accept();
  });

  await test('take a screenshot', async () => {
    const buffer = await driver.activeWindow.takeScreenshot();
    assert(buffer instanceof Buffer);
  });

  await test('set a value in cookie-storage', async () => {
    const cookie1 = {
      name: 'testKey',
      value: '2468',
    };
    const cookie2 = {
      name: 'testKeySecond',
      value: 'hello',
    };

    await driver.cookieStorage.setCookie(cookie1);
    await driver.cookieStorage.setCookie(cookie2);
  });

  await test('get a value in cookie-storage', async () => {
    const cookie = await driver.cookieStorage.getCookie('testKey');
    if (!cookie) {
      throw new Error('Cookie should not be undefined');
    }
    assert.equal(cookie.name, 'testKey');
    assert.equal(cookie.value, '2468');
  });

  await test('get the size of cookie-storage', async () => {
    const size = await driver.cookieStorage.getSize();
    assert(typeof size === 'number');
  });

  await test('get all keys in cookie-storage', async () => {
    const keys = await driver.cookieStorage.getKeys();
    assert(keys.includes('testKey'));
    assert(keys.includes('testKeySecond'));
  });

  await test('remove a key from cookie-storage', async () => {
    await driver.cookieStorage.removeCookie('testKey');
    const keys = await driver.cookieStorage.getKeys();
    assert(!keys.includes('testKey'));
    assert(keys.includes('testKeySecond'));
  });

  await test('get all cookies in cookie-storage', async () => {
    const cookies = await driver.cookieStorage.getCookies();
    assert(Array.isArray(cookies));
  });

  await test('clear the cookie-storage', async () => {
    await driver.cookieStorage.clear();
    assert.equal(await driver.cookieStorage.getSize(), 0);
  });

  await test('set a value in local-storage', async () => {
    await driver.localStorage.setItem('testKey', '2468');
    await driver.localStorage.setItem('testKeySecond', 'hello');
  });

  await test('get a value in local-storage', async () => {
    assert.equal(await driver.localStorage.getItem('testKey'), '2468');
  });

  await test('get the size of local-storage', async () => {
    assert.equal(await driver.localStorage.getSize(), 2);
  });

  await test('get all keys in local-storage', async () => {
    assert.deepEqual(await driver.localStorage.getKeys(), ['testKey', 'testKeySecond']);
  });

  await test('remove a key from local-storage', async () => {
    await driver.localStorage.removeItem('testKey');
    assert.equal(await driver.localStorage.getSize(), 1);
    assert.deepEqual(await driver.localStorage.getKeys(), ['testKeySecond']);
  });

  await test('clear the local-storage', async () => {
    await driver.localStorage.clear();
    assert.equal(await driver.localStorage.getSize(), 0);
  });

  await test('set a value in session-storage', async () => {
    await driver.sessionStorage.setItem('testKey', '2468');
    await driver.sessionStorage.setItem('testKeySecond', 'hello');
  });

  await test('get a value in session-storage', async () => {
    assert.equal(await driver.sessionStorage.getItem('testKey'), '2468');
  });

  await test('get the size of session-storage', async () => {
    assert.equal(await driver.sessionStorage.getSize(), 2);
  });

  await test('get all keys in session-storage', async () => {
    assert.deepEqual(await driver.sessionStorage.getKeys(), ['testKey', 'testKeySecond']);
  });

  await test('remove a key from session-storage', async () => {
    await driver.sessionStorage.removeItem('testKey');
    assert.equal(await driver.sessionStorage.getSize(), 1);
    assert.deepEqual(await driver.sessionStorage.getKeys(), ['testKeySecond']);
  });

  await test('clear the session-storage', async () => {
    await driver.sessionStorage.clear();
    assert.equal(await driver.sessionStorage.getSize(), 0);
  });

  await test('get the text of an element', async () => {
    const element = await driver.activeWindow.getElement('q', SelectorTypes.NAME);
    assert.equal(await element.getAttribute('value'), '1357');
  });

  await test('clear the text of an input element', async () => {
    const element = await driver.activeWindow.getElement('[name="q"]');
    await element.clear();
    assert.equal(await element.getAttribute('value'), '');
  });

  await test('write text into an input element', async () => {
    const element = await driver.activeWindow.getElement('q', SelectorTypes.NAME);
    await element.sendKeys('test-45');
    assert.equal(await element.getAttribute('value'), 'test-45');
  });

  await test('get a server status', async () => {
    const status = await getStatus(driver.remote, driver.options);

    // Not required, but still execute and see if fails
    status.getBuildVersion();
    status.getBuildRevision();
    status.getBuildTime();

    // Sauce labs doesn't support these so we return undefined
    status.getOSVersion();
    status.getOSArchitecture();
    status.getOSName();
  });

  // TODO: this feature is not supported by sauce labs:
  // test("get a session list", async () => {
  //   const sessions = await getSessions(driver.remote, driver.options);
  //   console.log(sessions);
  // });
  await test('get capabilities information', async () => {
    const session = await driver.session;
    console.dir(session.capabilities);
  });

  await test('get an element', async () => {
    const element = await driver.activeWindow.getElement('h1');
  });
  await test('test whether an element is displayed', async () => {
    const element = await driver.activeWindow.getElement('h1');
    assert(await element.isDisplayed());
    const hiddenElement = await driver.activeWindow.getElement('#hidden');
    assert(!await hiddenElement.isDisplayed());
  });

  await test('get an attribute of an element', async () => {
    const element = await driver.activeWindow.getElement('#has-attribute');
    assert.equal(await element.getAttribute('data-attribute'), 'value');
  });

  await test('type text into an element', async () => {
    const element = await driver.activeWindow.getElement('[name="q"]');
    await element.clear();
    await element.sendKeys('hello');
    await element.sendKeys([' ', 'world']);
    assert.equal(await element.getAttribute('value'), 'hello world');
    await element.clear();
    assert.equal(await element.getAttribute('value'), '');
  });

  await test('get the text content of an element', async () => {
    const element = await driver.activeWindow.getElement('#has-text');
    assert.equal(await element.getText(), 'test content');
  });

  await test('click on a button', async () => {
    const button = await driver.activeWindow.getElement('#clickable');
    await button.mouse.click();
    assert.equal(await button.getText(), 'clicked');
  });

  await test('get the position of the active window', async () => {
    const position = await driver.activeWindow.getPosition();
    assert.equal(typeof position, 'object');
    assert.equal(typeof position.x, 'number');
    assert.equal(typeof position.y, 'number');
  });

  await test('get the size of the active window', async () => {
    const size = await driver.activeWindow.getSize();
    assert.equal(typeof size, 'object');
    assert.equal(typeof size.width, 'number');
    assert.equal(typeof size.height, 'number');
  });

  await test('resize the active window', async () => {
    await driver.activeWindow.resize(500, 300);
    assert.deepEqual(await driver.activeWindow.getSize(), {width: 500, height: 300});
  });

  await test('position the active window', async () => {
    await driver.activeWindow.position(160, 163);
    assert.deepEqual(await driver.activeWindow.getPosition(), {x: 160, y: 163});
  });

  await test('maximize the active window', async () => {
    await driver.activeWindow.maximize();
  });

  await test('close the active window', async () => {
    await driver.activeWindow.close();
  });
}

// TODO: sauce job info
// TODO: test touch interface
export default run;
