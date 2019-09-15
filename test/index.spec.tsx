import { assert } from "chai";
import { mount } from "enzyme";
import * as React from "react";
import * as sinon from "sinon";
import { setStateCallback } from "../src/index";

interface TestProps<T> {
  onChange: (arg: T) => void;
  value: T;
}

function HookTest<T>(props: TestProps<T>) {
  const [hookValue, hookSetValue] = setStateCallback<T>(props.value, props.onChange);

  React.useEffect(() => hookSetValue(props.value), [props.value]);

  return <>{hookValue}</>;
}

describe("The setStateCallback hook", (): void => {
  afterEach((): void => {
    sinon.restore();
  });

  it("Should not invoke state change callback from initial state", (): void => {
    const callbackSpy = sinon.spy();
    const wrapper = mount(<HookTest value={5} onChange={callbackSpy} />);

    assert.equal(wrapper.text(), "5");
    assert.isFalse(callbackSpy.called);
  });

  it("Should invoke state change callback for state changes after initial state", (): void => {
    const callbackSpy = sinon.spy();
    const wrapper = mount(<HookTest value={5} onChange={callbackSpy} />);

    wrapper.setProps({ value: 10 });
    wrapper.update();

    assert.equal(wrapper.text(), "10");
    assert.isTrue(callbackSpy.calledOnce);
    assert.isTrue(callbackSpy.calledWith(10));

    wrapper.setProps({ value: 15 });
    wrapper.update();

    assert.equal(wrapper.text(), "15");
    assert.isTrue(callbackSpy.calledTwice);
    assert.isTrue(callbackSpy.calledWith(15));
  });
});
