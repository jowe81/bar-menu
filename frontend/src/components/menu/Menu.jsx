import React from 'react'
import { useState, useEffect } from "react";
import constants from '../../constants';
import './menu.css';

function Menu() {
    const [menu, setMenu] = useState([]);
    const [config, setConfig] = useState([]);
    const baseUrl = `${constants.apiRoot}/records/`;
    const pushEndpoint = `${constants.apiRoot}/${constants.apiPushEndpoint}`;

    // Toggle the open flag.
    function openClose(e) {
        const record = { ...config }
        record.open = !record.open;
        updateDb(record, constants.configCollectionName).then(data => setConfig(record));
    }

    // Use Dynforms M2M to update the record in the database.
    async function updateDb(record, collectionName) {
        return fetch(pushEndpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                collectionName,
                record,
                clientId: constants.clientId
            }),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Database update failed.");
                }
                return response.json();
            })
            .then((data) => {
                console.log("Update successful.");
            })
            .catch((error) => {
                console.error("Error:", error);
            });
    }

    // Update a property on an item on the record.
    function setItemProperty(record, itemName, propertyName, value) {
        const itemIndex = record.items.findIndex((item) => item.name === itemName);
        record.items[itemIndex][propertyName] = value;
    }

    useEffect(() => {
        // Fetch the configuration.
        function fetchData() {
            fetch(`${baseUrl}${constants.configCollectionName}`)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Bad response from dynforms.");
                    }
                    return response.json();
                })
                .then((data) => {
                    if (!Array.isArray(data.records) || data.records.length === 0) {
                        throw new Error("Bad configuration returned from server.");
                    }

                    setConfig(data.records[0]);

                    // Fetch the menu.
                    fetch(`${baseUrl}${constants.menuCollectionName}`)
                        .then((response) => {
                            if (!response.ok) {
                                throw new Error("Bad response from dynforms.");
                            }
                            return response.json();
                        })
                        .then((data) => {
                            setMenu(data.records);
                        })
                        .catch((err) => {
                            console.error("Error fetching menu:", err);
                        });
                })
                .catch((err) => {
                    console.error("Error fetching configuration:", err);
                });
        }

        fetchData();
        
        // Reload periodically
        const handle = setInterval(fetchData, 30000);

        return () => clearInterval(handle);
    }, [])
 
    const groupsToShow = menu.filter(itemGroup => itemGroup.show_group);

    const menuStyle = {
        backgroundImage: `url(${config.background_image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        width: '100vw',
        height: '100vh',
    }
    const topHeaderStyle = {
        position: "absolute",
        left: config.top_header_x + "px",
        top: config.top_header_y + "px",
        width: config.top_header_width + "px",
        textAlign: 'center',
        fontSize: config.top_header_font_size + "px",
        fontWeight: "bold",
        textShadow: "0.05em 0.05em 0.1em rgba(0, 0, 0, 0.4)",
        color: config.font_color ?? constants.defaultColor,
    };

    const menuJSX = (
        <>
            <div className="menu-top-header" style={topHeaderStyle}>
                {config.top_header}
            </div>

            {groupsToShow.map((itemGroup, index) => {
                if (!itemGroup.font_size) {
                    // Default
                    itemGroup.font_size = 40;
                }

                const itemGroupStyle = {
                    position: "absolute",
                    left: itemGroup.x + "px",
                    top: itemGroup.y + "px",
                    width: itemGroup.width + "px",
                    height: itemGroup.height + "px",
                    fontSize: itemGroup.font_size + "px",
                    border: itemGroup.border,
                    padding: 25,
                    textShadow: "0.05em 0.05em 0.1em rgba(0, 0, 0, 0.4)",
                    textAlign: "center",
                    color: itemGroup.font_color ?? config.font_color ?? constants.defaultColor,
                };

                const groupNameStyle = {
                    fontSize: (itemGroup.header_font_size ?? itemGroup.font_size) + 5 + "px",
                    fontWeight: "bold",
                    textDecoration: "underline",
                    color: itemGroup.header_font_color ?? config.font_color ?? constants.defaultColor,
                };

                // Toggle availability on single click.
                function itemClick(e) {
                    const itemName = e.target.dataset.name;
                    const recordId = e.target.dataset.record_id;

                    // The attribute stores the boolean as a string, "true" or "false".
                    const availableString = e.target.dataset.available;
                    const available = availableString !== "false";
                    const availableToggled = !available;

                    // Update the database.
                    const record = menu.find((record) => record._id === recordId);
                    setItemProperty(record, itemName, "available", !available);
                    updateDb(record, constants.menuCollectionName).then(data => {
                        // Update the UI.
                        e.target.style.textDecoration = availableToggled ? "none" : "line-through";
                        e.target.style.opacity = availableToggled ? "100%" : "60%";
                        e.target.dataset.available = availableToggled ? "true" : "false";
                    });
                }

                // Hide the item on double click.
                function itemDoubleClick(e) {
                    const itemName = e.target.dataset.name;
                    const recordId = e.target.dataset.record_id;

                    // Update the database.
                    const record = menu.find((record) => record._id === recordId);
                    setItemProperty(record, itemName, "hidden", true);
                    updateDb(record, constants.menuCollectionName).then(data => {
                        // Update the UI (hide the item).
                        e.target.style.display = "none";
                    });
                }

                // Render the group.
                const itemsToShow = itemGroup.items
                    .filter((item) => !item.hide)
                    .sort((a, b) => (a.name > b.name ? 1 : -1));
                if (itemsToShow.length) {
                    // Have menu items to show.
                    return (
                        <div key={index} style={itemGroupStyle}>
                            <div style={groupNameStyle}>{itemGroup.group_name}</div>

                            {itemsToShow.map((item, index) => {
                                const itemStyle = {};
                                itemStyle.textDecoration = item.available ? "none" : "line-through";
                                (itemStyle.opacity = item.available ? "100%" : "60%"),
                                    (itemStyle.display = item.hidden ? "none" : "block");

                                return (
                                    <div
                                        key={index}
                                        data-name={item.name}
                                        data-record_id={itemGroup._id}
                                        data-available={item.available}
                                        style={itemStyle}
                                        onClick={itemClick}
                                        onDoubleClick={itemDoubleClick}
                                    >
                                        {item.name}
                                    </div>
                                );
                            })}
                        </div>
                    );
                } else {
                    // Group is empty
                    return <div></div>;
                }
            })}
        </>
    );

    return (
        <div className="menu-container" style={menuStyle}>
            <div className="open-close-btn" onClick={openClose}></div>
            {config.open ? menuJSX : <div className="bar-closed">Bar Closed</div>}
        </div>
    );
}



export default Menu