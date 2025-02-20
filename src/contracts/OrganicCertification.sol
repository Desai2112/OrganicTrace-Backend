// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract OrganicCertification is AccessControl, Pausable {
    bytes32 public constant CERTIFIER_ROLE = keccak256("CERTIFIER_ROLE");
    bytes32 public constant FARMER_ROLE = keccak256("FARMER_ROLE");
    bytes32 public constant MANUFACTURER_ROLE = keccak256("MANUFACTURER_ROLE");
    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");

    struct Certificate {
        uint256 id;
        address entityAddress;
        string entityName;
        string certificationType;
        uint256 issueDate;
        uint256 expiryDate;
        string status; // active, suspended, expired
        string[] products;
        string ipfsHash; // Stores additional certification details on IPFS
    }

    struct Product {
        uint256 id;
        string name;
        address owner;
        uint256 certificateId;
        string status;
        string[] trackingHistory;
        string ipfsHash; // Stores additional product details on IPFS
    }

    struct AuditRecord {
        uint256 id;
        uint256 certificateId;
        uint256 date;
        string auditType;
        string status;
        string ipfsHash; // Stores detailed audit reports on IPFS
    }

    mapping(uint256 => Certificate) public certificates;
    mapping(uint256 => Product) public products;
    mapping(uint256 => AuditRecord) public auditRecords;
    mapping(address => uint256[]) public entityCertificates;
    mapping(address => uint256[]) public entityProducts;

    uint256 private certificateCounter;
    uint256 private productCounter;
    uint256 private auditCounter;

    event CertificateIssued(uint256 indexed id, address indexed entity, string certificationType);
    event CertificateUpdated(uint256 indexed id, string status);
    event ProductRegistered(uint256 indexed id, address indexed owner, string name);
    event ProductTransferred(uint256 indexed id, address indexed from, address indexed to);
    event AuditRecorded(uint256 indexed certificateId, uint256 indexed auditId, string status);

    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function issueCertificate(
        address entity,
        string memory entityName,
        string memory certificationType,
        uint256 validityPeriod,
        string[] memory products,
        string memory ipfsHash
    ) external onlyRole(CERTIFIER_ROLE) whenNotPaused returns (uint256) {
        certificateCounter++;
        uint256 issueDate = block.timestamp;
        uint256 expiryDate = issueDate + validityPeriod;

        certificates[certificateCounter] = Certificate({
            id: certificateCounter,
            entityAddress: entity,
            entityName: entityName,
            certificationType: certificationType,
            issueDate: issueDate,
            expiryDate: expiryDate,
            status: "active",
            products: products,
            ipfsHash: ipfsHash
        });

        entityCertificates[entity].push(certificateCounter);
        emit CertificateIssued(certificateCounter, entity, certificationType);
        return certificateCounter;
    }

    function registerProduct(
        string memory name,
        uint256 certificateId,
        string memory ipfsHash
    ) external onlyRole(FARMER_ROLE) whenNotPaused returns (uint256) {
        require(certificates[certificateId].entityAddress == msg.sender, "Invalid certificate");
        require(
            keccak256(bytes(certificates[certificateId].status)) == keccak256(bytes("active")),
            "Certificate not active"
        );

        productCounter++;
        string[] memory initialHistory = new string[](1);
        initialHistory[0] = "Product registered";

        products[productCounter] = Product({
            id: productCounter,
            name: name,
            owner: msg.sender,
            certificateId: certificateId,
            status: "registered",
            trackingHistory: initialHistory,
            ipfsHash: ipfsHash
        });

        entityProducts[msg.sender].push(productCounter);
        emit ProductRegistered(productCounter, msg.sender, name);
        return productCounter;
    }

    function recordAudit(
        uint256 certificateId,
        string memory auditType,
        string memory status,
        string memory ipfsHash
    ) external onlyRole(CERTIFIER_ROLE) whenNotPaused returns (uint256) {
        require(certificates[certificateId].id != 0, "Certificate does not exist");
        
        auditCounter++;
        auditRecords[auditCounter] = AuditRecord({
            id: auditCounter,
            certificateId: certificateId,
            date: block.timestamp,
            auditType: auditType,
            status: status,
            ipfsHash: ipfsHash
        });

        emit AuditRecorded(certificateId, auditCounter, status);
        return auditCounter;
    }

    function transferProduct(uint256 productId, address to) 
        external 
        whenNotPaused 
    {
        require(products[productId].owner == msg.sender, "Not product owner");
        require(
            hasRole(MANUFACTURER_ROLE, to) || 
            hasRole(DISTRIBUTOR_ROLE, to),
            "Invalid recipient"
        );

        products[productId].owner = to;
        entityProducts[to].push(productId);
        emit ProductTransferred(productId, msg.sender, to);
    }

    function updateCertificateStatus(uint256 certificateId, string memory newStatus)
        external
        onlyRole(CERTIFIER_ROLE)
        whenNotPaused
    {
        require(certificates[certificateId].id != 0, "Certificate does not exist");
        certificates[certificateId].status = newStatus;
        emit CertificateUpdated(certificateId, newStatus);
    }

    // Additional helper functions
    function getCertificate(uint256 certificateId) external view returns (Certificate memory) {
        return certificates[certificateId];
    }

    function getProduct(uint256 productId) external view returns (Product memory) {
        return products[productId];
    }

    function getAuditRecord(uint256 auditId) external view returns (AuditRecord memory) {
        return auditRecords[auditId];
    }

    function getEntityCertificates(address entity) external view returns (uint256[] memory) {
        return entityCertificates[entity];
    }

    function getEntityProducts(address entity) external view returns (uint256[] memory) {
        return entityProducts[entity];
    }
} 