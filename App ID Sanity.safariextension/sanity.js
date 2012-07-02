var STATUS_ACTIVE = 'active';
var STATUS_INACTIVE = 'inactive';

var STORAGE_KEY_STATUS = 'status';
var STORAGE_KEY_PSEUDONYM = 'pseudonym';

function BundleId(bundleId) {
    this.bundleId = bundleId;
}

BundleId.prototype.getStorageKey = function(keyName) {
    return 'uk.co.goosoftware.app-id-sanity/' + this.bundleId + '/' + keyName;
}

BundleId.prototype.isActive = function() {
    return localStorage.getItem(this.getStorageKey(STORAGE_KEY_STATUS)) != STATUS_INACTIVE;
}

BundleId.prototype.setActive = function(isActive) {
    localStorage.setItem(this.getStorageKey(STORAGE_KEY_STATUS), isActive ? STATUS_ACTIVE : STATUS_INACTIVE);
}

BundleId.prototype.getPseudonym = function() {
    var result = localStorage.getItem(this.getStorageKey(STORAGE_KEY_PSEUDONYM));
    // 2012-06-18: Layout change on developer.apple.com resulted in
    // pseudonym DB getting contaminated with HTML cruft, specifically <br>
    // followed by some whitespace. Here we'll clean up those entries and
    // save the cleaned-up versions if needed.

    // If result is null there is nothing to clean up, bail.
    if (!result) return;

    var re = /\s*<br>.*/;
    var trimmed = result.replace(re, '');
    if (trimmed !== result) {
        this.setPseudonym(trimmed);
    }
    return trimmed;
}

BundleId.prototype.setPseudonym = function(pseudonym) {
    if (pseudonym.length > 0) {
        localStorage.setItem(this.getStorageKey(STORAGE_KEY_PSEUDONYM), pseudonym);
    }
    else {
        localStorage.removeItem(this.getStorageKey(STORAGE_KEY_PSEUDONYM));
    }
}

if (document.location.href.match('/manage/bundles/index.action')) {
    //--------------------------------------------
    // Index page
    //--------------------------------------------

    // Get all the rows in the table inside form#index
    $('form#index tr').each(function(index, tr){
        // Get the last <td> in the row - it contains the Configure link
        // where we'll find the bundle ID
        var tds = $(tr).find('td');

        if (tds.length) { // ignore the header row, which has <th> elements
            // Get the bundle ID from the Configure link
            var matches = tds.last().html().match('\\?displayId=([A-Z0-9]+)');
            if (matches) {
                var bundleId = new BundleId(matches[1]);
                $(tr).toggleClass('inactive', !bundleId.isActive());
                
                // Make the description editable
                var name_td = $(tr).find('td.name');
                var re = /<br>([^<]+)/;
                name_td.html(name_td.html().replace(re, '<br><input type="text" class="description" placeholder="$1" value="$1"></input>'));
                                
                var description = name_td.find('input.description');
                var pseudonym = bundleId.getPseudonym();
                if (pseudonym && pseudonym.length > 0) {
                    description.val(pseudonym);
                };
                
                // Update the bundleId pseudonym as the user changes it
                description.bind('paste cut keyup mouseup change', function(){
                    bundleId.setPseudonym(description.val());
                });

                // Create the active/inactive checkbox
                var checkbox = $('<input type="checkbox"></input>');
                checkbox.prop('checked', bundleId.isActive());
                checkbox.click(function(event) {
                    var is_active = $(this).is(':checked');
                    bundleId.setActive(is_active);
                    $(tr).toggleClass('inactive', !is_active);
                });

                // Create a new <td> to store the active/inactive checkbox
                var delete_td = $('<td style="vertical-align:middle; text-align:center;"></td>');
                
                // Append checkbox to td, appent td to tr
                delete_td.append(checkbox);
                $(tr).append(delete_td);
            }
        } else {
            $(tr).append($('<th>Active</th>'));
        }
    });
} else if (document.location.href.match('/manage/bundles/configure.action')) {
    //--------------------------------------------
    // Single bundle ID detail page
    //--------------------------------------------
    
    var matches = document.location.href.match('\\?displayId=([A-Z0-9]+)$');
    if (matches) {
        var bundleId = new BundleId(matches[1]);
        var pseudonym = bundleId.getPseudonym();
        if (pseudonym) {
            var original_name = $('.provprofilebadge .details strong').html();
            $('.provprofilebadge .details strong').html(pseudonym);
            $('.provprofilebadge .details strong').append($('<span class="original_name"> (original name: "' + original_name + '")</span>'));
        }
        
        var statusContainer = $('<div class="statusLabel"></div>');
        var statusLabel = $('<span class="label"></span>');
        statusLabel.html(bundleId.isActive() ? "Active" : "Inactive");
        statusContainer.append(statusLabel);
        statusContainer.append($('<br/>'));
        
        var toggleLink = $('(<a id="toggleStatusLink" href="#">Change</a>)');
        statusContainer.append(toggleLink);
        statusContainer.toggleClass('active', bundleId.isActive());
        
        toggleLink.click(function(){
            bundleId.setActive(!bundleId.isActive());
            statusLabel.html(bundleId.isActive() ? "Active" : "Inactive");
            statusContainer.toggleClass('active', bundleId.isActive());
            return false;
        });
        
        $('.provprofilebadge .details').prepend(statusContainer);
    }    
}

// If this page has a cfBundleDisplayId <select> element, update its entries.
if ($('select[name="cfBundleDisplayId"]').length > 0) {
    $('select[name="cfBundleDisplayId"] option[value!=""]').each(function(index, option) {
        var bundleId = new BundleId($(option).val());

        // if this bundle ID's inactive, remove it from the drop down
        if (!bundleId.isActive()) {
            $(option).remove();
        } else {
            // If this bundle ID has a pseudonym, use it here
            var pseudonym = bundleId.getPseudonym();
            if (pseudonym) {
                $(option).html(pseudonym);
            };
        }
    });

    // Finally, take the filtered, updated list and sort it in name order.
    var options = $('select[name="cfBundleDisplayId"] option[value!=""]');
    options.sort(function (a, b){
        return $(a).html().localeCompare($(b).html());
    });
    $('select[name="cfBundleDisplayId"]').remove('option[value!=""]').append(options);
}
