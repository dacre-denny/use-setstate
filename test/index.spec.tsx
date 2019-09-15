import { assert } from "chai";
import { mount } from "enzyme";
import * as React from "react";
import * as sinon from "sinon";
import { setStateCallback } from "../src/index";

describe("The setStateCallback hook", (): void => {
  afterEach((): void => {
    sinon.restore();
  });

  it("some thing", (): void => {
    setStateCallback();

    const warnStub = sinon.stub(console, "warn");
    const wrapper = mount(
      <div>
        <p>test</p>
      </div>
    );

    assert.isTrue(
      wrapper.containsMatchingElement(
        <div>
          <p>test</p>
        </div>
      )
    );
    assert.isFalse(warnStub.called);
  });
});
