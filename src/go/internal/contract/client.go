package contract

import (
	"context"
	"crypto/ecdsa"
	"math/big"

	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/ethclient"
)

type PassportClient struct {
	client     *ethclient.Client
	privateKey *ecdsa.PrivateKey
	auth       *bind.TransactOpts
	address    common.Address
}

type ReputationData struct {
	OverallScore        *big.Int
	ReliabilityScore    *big.Int
	ProfessionalismScore *big.Int
	CommunityTrustScore  *big.Int
	TotalEndorsements   *big.Int
	TotalReviews        *big.Int
	LastUpdated         *big.Int
	ProofHash           [32]byte
}

type CredentialInfo struct {
	SubjectHash    string
	CredentialType string
	IssuedAt       *big.Int
	ExpiresAt      *big.Int
	IsLocked       bool
	Owner          common.Address
}

func NewPassportClient(rpcURL string, privateKeyHex string, contractAddr string) (*PassportClient, error) {
	client, err := ethclient.Dial(rpcURL)
	if err != nil {
		return nil, err
	}

	privateKey, err := crypto.HexToECDSA(privateKeyHex)
	if err != nil {
		return nil, err
	}

	chainID, err := client.NetworkID(context.Background())
	if err != nil {
		return nil, err
	}

	auth, err := bind.NewKeyedTransactorWithChainID(privateKey, chainID)
	if err != nil {
		return nil, err
	}

	return &PassportClient{
		client:     client,
		privateKey: privateKey,
		auth:       auth,
		address:    common.HexToAddress(contractAddr),
	}, nil
}

func (c *PassportClient) IssuePassport(
	ctx context.Context,
	to common.Address,
	subjectHash string,
	credentialType string,
	uri string,
	expiresAt *big.Int,
) error {
	abi, err := c.loadFacadeABI()
	if err != nil {
		return err
	}

	input, err := abi.Pack("issuePassport", to, subjectHash, credentialType, uri, expiresAt)
	if err != nil {
		return err
	}

	tx, err := c.auth.Signer(c.auth.From, c.auth.Signer)
	if err != nil {
		return err
	}
	_ = tx
	return nil
}

func (c *PassportClient) GetPassportInfo(ctx context.Context, tokenID *big.Int) (*CredentialInfo, error) {
	abi, err := c.loadFacadeABI()
	if err != nil {
		return nil, err
	}

	callData, err := abi.Pack("getPassportInfo", tokenID)
	if err != nil {
		return nil, err
	}

	result, err := c.client.CallContract(ctx, callData, nil)
	if err != nil {
		return nil, err
	}

	unpacked, err := abi.Unpack("getPassportInfo", result)
	if err != nil {
		return nil, err
	}

	info := &CredentialInfo{}
	if len(unpacked) >= 6 {
		info.SubjectHash = unpacked[0].(string)
		info.CredentialType = unpacked[1].(string)
		info.IssuedAt = unpacked[2].(*big.Int)
		info.ExpiresAt = unpacked[3].(*big.Int)
		info.IsLocked = unpacked[4].(bool)
		info.Owner = unpacked[5].(common.Address)
	}

	return info, nil
}

func (c *PassportClient) GetReputation(ctx context.Context, subjectHash string) (*ReputationData, error) {
	abi, err := c.loadReputationABI()
	if err != nil {
		return nil, err
	}

	callData, err := abi.Pack("getReputation", subjectHash)
	if err != nil {
		return nil, err
	}

	result, err := c.client.CallContract(ctx, callData, nil)
	if err != nil {
		return nil, err
	}

	unpacked, err := abi.Unpack("getReputation", result)
	if err != nil {
		return nil, err
	}

	rep := &ReputationData{}
	if len(unpacked) > 0 {
		data := unpacked[0].(struct {
			OverallScore        *big.Int
			ReliabilityScore    *big.Int
			ProfessionalismScore *big.Int
			CommunityTrustScore  *big.Int
			TotalEndorsements   *big.Int
			TotalReviews        *big.Int
			LastUpdated         *big.Int
			ProofHash           [32]byte
		})
		rep.OverallScore = data.OverallScore
		rep.ReliabilityScore = data.ReliabilityScore
		rep.ProfessionalismScore = data.ProfessionalismScore
		rep.CommunityTrustScore = data.CommunityTrustScore
		rep.TotalEndorsements = data.TotalEndorsements
		rep.TotalReviews = data.TotalReviews
		rep.LastUpdated = data.LastUpdated
		rep.ProofHash = data.ProofHash
	}

	return rep, nil
}

func (c *PassportClient) loadFacadeABI() (interface{}, error) {
	return nil, nil
}

func (c *PassportClient) loadReputationABI() (interface{}, error) {
	return nil, nil
}

func (c *PassportClient) Close() {
	c.client.Close()
}
