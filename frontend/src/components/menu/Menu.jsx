import React from 'react'
import { useState, useEffect } from "react";
import constants from '../../constants';

function Menu() {
    const [menu, setMenu] = useState([]);
    const [config, setConfig] = useState([]);
    const baseUrl = `${constants.apiRoot}/records/`;

    useEffect(() => {
        // Fetch the configuration.
        function fetchData() {
            fetch(`${baseUrl}${constants.configCollectionName}`)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Bad response from dynforms server (fetching configuration).");
                    }
                    return response.json();
                })
                .then((data) => {
                    if (!Array.isArray(data.records) || data.records.length === 0) {
                        throw new Error("Bad configuration returned from server.");
                    }

                    console.log("Successfully fetched the configuration.", data.records[0]);

                    setConfig(data.records[0]);

                    // Fetch the menu.
                    fetch(`${baseUrl}${constants.menuCollectionName}`)
                        .then((response) => {
                            if (!response.ok) {
                                throw new Error("Bad response from dynforms server (fetching menu).");
                            }
                            return response.json();
                        })
                        .then((data) => {
                            console.log(`Successfully fetched the menu. (${data.records.length} groups)`);
                            setMenu(data.records);
                        })
                        .catch((err) => {
                            console.log("Error", err);
                        });
                })
                .catch((err) => {
                    console.log("Error", err);
                });
        }

        fetchData();
        
        // Reload periodically
        const handle = setInterval(fetchData, 30000);

        return () => clearInterval(handle);
    }, [])
 
    const groupsToShow = menu.filter(itemGroup => itemGroup.show_group);

    console.log('Showing the following groups:', groupsToShow.map(group => group.group_name).join(', '));

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
    };
    return (
        <div className="menu-container" style={menuStyle}>
            <div className="menu-top-header" style={topHeaderStyle}>
                {config.top_header}
            </div>

            {groupsToShow.map((itemGroup, index) => {
                if (!itemGroup.font_size) {
                    itemGroup.font_size = 30;
                }
                const itemGroupStyle = {
                    position: "absolute",
                    left: itemGroup.x + "px",
                    top: itemGroup.y + "px",
                    width: itemGroup.width + "px",
                    //height: itemGroup.height + "px",
                    fontSize: itemGroup.font_size + "px",
                    border: itemGroup.border,
                    padding: 25,
                    textShadow: "0.05em 0.05em 0.1em rgba(0, 0, 0, 0.4)",
                    textAlign: 'center',
                };

                const groupNameStyle = {
                    fontSize: itemGroup.font_size + 5 + "px",
                    fontWeight: "bold",
                    textDecoration: "underline",
                };

                const itemsToShow = itemGroup.items.filter((item) => item.quantity > 0).sort((a, b) => a.name > b.name ? 1 : -1);
                console.log('items', itemsToShow)

                if (itemsToShow.length) {
                    return (
                        <div key={index} style={itemGroupStyle}>
                            <div style={groupNameStyle}>{itemGroup.group_name}</div>

                            {itemsToShow.map((item, index) => {
                                return <div key={index}>{item.name}</div>;
                            })}
                        </div>
                    );
                } else {
                    return <></>;
                }
            })}
        </div>
    );
}

export default Menu