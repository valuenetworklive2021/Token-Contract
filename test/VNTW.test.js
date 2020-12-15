const { expectRevert, expectEvent } = require("@openzeppelin/test-helpers");
const Token = artifacts.require("VNTW.sol");

contract("VNTW", (accounts) => {
  let token;
  const initialBalance = web3.utils.toBN(web3.utils.toWei("100000000"));

  beforeEach(async () => {
    token = await Token.new();
  });

  it("should return the total supply", async () => {
    const supply = await token.totalSupply();
    assert(supply.eq(initialBalance));
  });

  it("should return the correct balance", async () => {
    const balance = await token.balanceOf(accounts[0]);
    assert(balance.eq(initialBalance));
  });

  it("should transfer token when approved", async () => {
    let allowance;
    let receipt;
    const _100 = web3.utils.toBN(100);

    allowance = await token.allowance(accounts[0], accounts[1]);
    assert(allowance.isZero());

    receipt = await token.approve(accounts[1], _100);
    allowance = await token.allowance(accounts[0], accounts[1]);
    assert(allowance.eq(_100));
    expectEvent(receipt, "Approval", {
      owner: accounts[0],
      spender: accounts[1],
      value: _100,
    });

    receipt = await token.transferFrom(accounts[0], accounts[2], _100, {
      from: accounts[1],
    });
    allowance = await token.allowance(accounts[0], accounts[1]);
    const balance1 = await token.balanceOf(accounts[0]);
    const balance2 = await token.balanceOf(accounts[2]);
    assert(balance1.eq(initialBalance.sub(_100)));
    assert(balance2.eq(_100));
    assert(allowance.isZero());
    expectEvent(receipt, "Transfer", {
      from: accounts[0],
      to: accounts[2],
      value: _100,
    });
  });

  it("should NOT transfer token if not approved", async () => {
    await expectRevert(
      token.transferFrom(accounts[0], accounts[1], 10),
      "ERC20: transfer amount exceeds allowance"
    );
  });
});
