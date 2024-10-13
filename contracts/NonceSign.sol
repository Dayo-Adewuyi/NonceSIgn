// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title NonceSign Contract
/// @notice This contract allows for document creation, signing, and tracking.
/// @dev This contract uses pausable functionality.
contract NonceSign is Pausable, ReentrancyGuard {
    struct Document {
        string title;
        string description;
        string fileHash;
        address[] signers;
        address creator;
        bool completed;
    }

    struct Signature {
        address signer;
        string signatureHash;
        uint256 timestamp;
    }

    mapping(uint256 => Document) private documents;
    mapping(uint256 => Signature[]) private documentSignatures;
    uint256 private documentCount;
    address private owner;
    mapping(address => uint256[]) private userCreatedDocuments;
    mapping(address => uint256[]) private userSignedDocuments;

    /// @notice Emitted when a document is created.
    event DocumentCreated(
        uint256 indexed documentId,
        string title,
        address[] signers,
        address creator
    );

    /// @notice Emitted when a document is signed.
    event DocumentSigned(
        uint256 indexed documentId,
        address signer,
        string signatureHash
    );

    /// @notice Emitted when a document is fully signed and completed.
    event DocumentCompleted(uint256 indexed documentId);

    constructor() {
        documentCount = 0;
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    /// @notice Creates a new document to be signed by the specified signers.
    function createDocument(
        string memory _title,
        string memory _description,
        string memory _fileHash,
        address[] memory _signers
    ) external whenNotPaused {
        require(_signers.length != 0, "At least one signer is required");
        require(bytes(_fileHash).length != 0, "File hash cannot be empty");
        require(bytes(_title).length != 0, "Title cannot be empty");

        uint256 documentId = documentCount++;
        Document storage newDoc = documents[documentId];
        newDoc.title = _title;
        newDoc.fileHash = _fileHash;
        newDoc.signers = _signers;
        newDoc.description = _description;
        newDoc.creator = msg.sender;
        newDoc.completed = false;

        userCreatedDocuments[msg.sender].push(documentId);

        emit DocumentCreated(documentId, _title, _signers, msg.sender);
    }

    /// @notice Allows a signer to sign a document.
    function signDocument(
        uint256 _documentId,
        string memory _signatureHash
    ) external whenNotPaused nonReentrant {
        Document storage doc = documents[_documentId];
        require(!doc.completed, "Document already completed");
        require(
            isAuthorizedSigner(msg.sender, doc.signers),
            "Not authorized to sign"
        );
        require(!hasSignerSigned(_documentId, msg.sender), "Already signed");
        require(bytes(_signatureHash).length != 0, "Signature hash cannot be empty");

        Signature memory newSignature = Signature({
            signer: msg.sender,
            signatureHash: _signatureHash,
            timestamp: block.timestamp
        });

        documentSignatures[_documentId].push(newSignature);
        userSignedDocuments[msg.sender].push(_documentId);

        emit DocumentSigned(_documentId, msg.sender, _signatureHash);

        if (allSigned(_documentId)) {
            doc.completed = true;
            doc.fileHash = _signatureHash;
            emit DocumentCompleted(_documentId);
        }
    }

    /// @notice Returns document IDs assigned to a specific user to sign.
      function getDocumentsCreatedByUser(address _user) external view returns (Document[] memory) {
        uint256[] storage userDocs = userCreatedDocuments[_user];
        Document[] memory createdDocs = new Document[](userDocs.length);

        for (uint256 i = 0; i < userDocs.length; i++) {
            createdDocs[i] = documents[userDocs[i]];
        }

        return createdDocs;
    }

    /// @notice Returns all documents assigned to a specific user for signing.
    /// @param _user The address of the user whose assigned documents are being retrieved.
    /// @return An array of Document structs assigned to the specified user for signing.
    function getDocumentsAssignedToUserForSigning(address _user) external view returns (Document[] memory) {
        uint256 assignedCount = 0;
        for (uint256 i = 0; i < documentCount; i++) {
            if (isAuthorizedSigner(_user, documents[i].signers) && !documents[i].completed) {
                assignedCount++;
            }
        }

        Document[] memory assignedDocs = new Document[](assignedCount);
        uint256 index = 0;
        for (uint256 i = 0; i < documentCount; i++) {
            if (isAuthorizedSigner(_user, documents[i].signers) && !documents[i].completed) {
                assignedDocs[index] = documents[i];
                index++;
            }
        }

        return assignedDocs;
    }

    /// @notice Returns details of a specific document.
    function getDocument(
        uint256 _documentId
    )
        external
        view
        returns (
            string memory title,
            string memory description,
            string memory fileHash,
            address[] memory signers,
            address creator,
            bool completed
        )
    {
        Document storage doc = documents[_documentId];
        return (
            doc.title,
            doc.description,
            doc.fileHash,
            doc.signers,
            doc.creator,
            doc.completed
        );
    }

    /// @notice Returns the signatures for a specific document.
    function getDocumentSignatures(
        uint256 _documentId
    ) external view returns (Signature[] memory) {
        return documentSignatures[_documentId];
    }

    /// @dev Checks if a signer is authorized for a document.
    function isAuthorizedSigner(
        address _signer,
        address[] memory _signers
    ) internal pure returns (bool) {
        for (uint256 i = 0; i < _signers.length; i++) {
            if (_signers[i] == _signer) {
                return true;
            }
        }
        return false;
    }

    /// @notice Checks if a specific signer has signed a document.
    function hasSignerSigned(
        uint256 _documentId,
        address _signer
    ) public view returns (bool) {
        Signature[] storage signatures = documentSignatures[_documentId];
        for (uint256 i = 0; i < signatures.length; i++) {
            if (signatures[i].signer == _signer) {
                return true;
            }
        }
        return false;
    }

    /// @dev Checks if all authorized signers have signed the document.
    function allSigned(uint256 _documentId) internal view returns (bool) {
        Document storage doc = documents[_documentId];
        for (uint256 i = 0; i < doc.signers.length; i++) {
            if (!hasSignerSigned(_documentId, doc.signers[i])) {
                return false;
            }
        }
        return true;
    }

    /// @notice Pauses contract actions.
    function pause() external onlyOwner {
        _pause();
    }

    /// @notice Unpauses contract actions.
    function unpause() external onlyOwner {
        _unpause();
    }
}
