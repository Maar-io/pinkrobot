import { Button } from "./Button";
import { useUI } from "../hooks";
import { AccountsDropdown } from "./AccountsDropdown";
import { useWallet } from "useink";
import { connectedNetwork, story } from "../const";
import classNames from "classnames";

export const Header = () => {
  const { account, accounts } = useWallet();
  const { setShowConnectWallet } = useUI();

  return (
    <div className="header-container">
      <div className="flex items-center justify-between w-full">
        <img
          src="assets/pink-logo-300.png"
          className="pink-logo"
          alt="PinkRobot"
          title={story}
        />
        <img
          src="assets/pink-logo.png"
          className="pink-logo-mobile"
          alt="PinkRobot"
        />
        <div className="wallet-wrapper">
          <div className="pink-network-logo">
            {connectedNetwork === "Shibuya" ? (
              <img src="assets/shibuya.svg" alt="Shibuya" />
            ) : (
              <img src="assets/astar.svg" alt="Astar" />
            )}
          </div>
          {!account ? (
            <Button
              className={classNames(
                "relative w-full cursor-default rounded-lg bg-pink-100 py-2 pl-3 pr-10 text-left shadow-md",
                "focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white",
                "focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300",
                "sm:text-sm hover:cursor-pointer bg-pink-transparent hover:bg-pink-transparent2"
              )}
              onClick={() => setShowConnectWallet(true)}
            >
              Connect Wallet
            </Button>
          ) : (
            <div className="flex items-center justify-end accounts-dropdown">
              {accounts && accounts.length > 0 && <AccountsDropdown />}
              {/* <button
              onClick={disconnect}
              className="py-1 px-2 text-xs bg-gray-800 bg-opacity-0 text-gray-300 hover:bg-gray-800 hover:bg-opacity-0 relative left-[4px]"
              title="disconnect wallet"
            >
              <XCircleIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </button> */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
