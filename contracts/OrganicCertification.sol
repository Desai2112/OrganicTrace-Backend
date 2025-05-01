// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract OrganicCertification is AccessControl {
    // Define roles
    bytes32 public constant CERTIFIER_ROLE = keccak256("CERTIFIER_ROLE");
    bytes32 public constant FARMER_ROLE = keccak256("FARMER_ROLE");
    bytes32 public constant MANUFACTURER_ROLE = keccak256("MANUFACTURER_ROLE");

    struct Certificate {
        uint256 id;
        string entityId;
        string entityName;
        string certificationType;
        uint256 issueDate;
        uint256 expiryDate;
        string status;
        uint256[] productIds;
        string ipfsHash;
    }

    struct Product {
        uint256 id;
        string name;
        string ownerId;
        uint256 certificateId;
        string status;
        string ipfsHash;
    }

    struct ManufacturingRecord {
        uint256 id;
        uint256 productId;
        uint256 certificateId;
        string manufacturerId;
        string status;
        string ipfsHash;
    }

    mapping(uint256 => Certificate) public certificates;
    mapping(uint256 => Product) public products;
    mapping(uint256 => ManufacturingRecord) public manufacturingRecords;
    mapping(string => uint256[]) public entityCertificates;
    mapping(string => uint256[]) public entityProducts;

    uint256 private certificateCounter;
    uint256 private productCounter;
    uint256 private manufacturingCounter;

    event CertificateIssued(uint256 indexed id, string indexed entityId, string certificationType);
    event ProductRegistered(uint256 indexed id, string indexed ownerId, string name);
    event ManufacturingRecordAdded(uint256 indexed id, uint256 productId, uint256 certificateId);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function issueCertificate(
        string memory entityId,
        string memory entityName,
        string memory certificationType,
        uint256 validityPeriod,
        uint256[] memory productIds,
        string memory ipfsHash
    ) external onlyRole(CERTIFIER_ROLE) returns (uint256) {
        certificateCounter++;
        uint256 issueDate = block.timestamp;
        uint256 expiryDate = issueDate + validityPeriod;

        certificates[certificateCounter] = Certificate({
            id: certificateCounter,
            entityId: entityId,
            entityName: entityName,
            certificationType: certificationType,
            issueDate: issueDate,
            expiryDate: expiryDate,
            status: "active",
            productIds: productIds,
            ipfsHash: ipfsHash
        });

        for (uint256 i = 0; i < productIds.length; i++) {
            require(
                keccak256(abi.encodePacked(products[productIds[i]].ownerId)) ==
                    keccak256(abi.encodePacked(entityId)),
                "Product does not belong to entity"
            );
            products[productIds[i]].certificateId = certificateCounter;
        }

        entityCertificates[entityId].push(certificateCounter);
        emit CertificateIssued(certificateCounter, entityId, certificationType);
        return certificateCounter;
    }

    function registerProduct(
        string memory ownerId,
        string memory name,
        string memory ipfsHash
    ) external onlyRole(FARMER_ROLE) returns (uint256) {
        productCounter++;
        products[productCounter] = Product({
            id: productCounter,
            name: name,
            ownerId: ownerId,
            certificateId: 0,
            status: "registered",
            ipfsHash: ipfsHash
        });

        entityProducts[ownerId].push(productCounter);
        emit ProductRegistered(productCounter, ownerId, name);
        return productCounter;
    }

    function addManufacturingRecord(
        uint256 productId,
        string memory manufacturerId,
        string memory status,
        string memory ipfsHash
    ) external onlyRole(MANUFACTURER_ROLE) returns (uint256) {
        require(products[productId].id != 0, "Product does not exist");
        require(products[productId].certificateId != 0, "Product not linked to a certificate");

        manufacturingCounter++;
        manufacturingRecords[manufacturingCounter] = ManufacturingRecord({
            id: manufacturingCounter,
            productId: productId,
            certificateId: products[productId].certificateId,
            manufacturerId: manufacturerId,
            status: status,
            ipfsHash: ipfsHash
        });

        emit ManufacturingRecordAdded(manufacturingCounter, productId, products[productId].certificateId);
        return manufacturingCounter;
    }

    function getCertificate(uint256 certificateId) external view returns (Certificate memory) {
        return certificates[certificateId];
    }

    function getProduct(uint256 productId) external view returns (Product memory) {
        return products[productId];
    }

    function getManufacturingRecord(uint256 recordId) external view returns (ManufacturingRecord memory) {
        return manufacturingRecords[recordId];
    }

    function getEntityCertificates(string memory entityId) external view returns (uint256[] memory) {
        return entityCertificates[entityId];
    }

    function getEntityProducts(string memory entityId) external view returns (uint256[] memory) {
        return entityProducts[entityId];
    }
}
