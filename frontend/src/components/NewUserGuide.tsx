export const NewUserGuide = ({
  hasAccounts,
  hasFunds,
  walletConnected,
}: {
  hasAccounts: boolean;
  hasFunds: boolean;
  walletConnected: boolean;
}) => {
  return (
    <div className="user-guide">
      {!walletConnected && (
        <div className="mb-2">
          <p>Wallet not connected.</p>
          <p>
            Make sure you have a{" "}
            <a
              href="https://chrome.google.com/webstore/detail/subwallet-polkadot-wallet/onhogfjeacnfoofkfgppdlbmlmnplgbn"
              target="_blank"
              rel="noopener noreferrer"
            >
              signer extension
            </a>{" "}
            installed.
          </p>
        </div>
      )}
      {walletConnected && !hasAccounts && (
        <div className="mb-2">
          <p>No Astar accounts found.</p>
          <p>You can import or create one in the extension.</p>
        </div>
      )}
      {hasAccounts && !hasFunds && (
        <>
          <div className="mb-1">
            <p className="mb-1">Account balance is zero.</p>
          </div>
        </>
      )}
    </div>
  );
};
