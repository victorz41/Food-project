const foodInput = document.querySelector('#food-title')

const foodCategory = document.querySelector('#food-category')

const foodQty = document.querySelector('#food-qty')

const pickupWindow = document.querySelector('#pickup-window')

const handlingNotes = document.querySelector('#handling-notes')

const nutsCheckbox = document.querySelector('#alg-nuts')

const dairyCheckbox = document.querySelector('#alg-dairy')

const glutenCheckbox = document.querySelector('#diet-gluten')

const vegetarianCheckbox = document.querySelector('#diet-veg')


const button = document.querySelector('button')
    button.onclick = function(){
        // console.log(foodInput.value)
        // console.log(foodCategory.value)
        // console.log(foodQty.value)
        // console.log(pickupWindow.value)
        // console.log(handlingNotes.value)
        // console.log(nutsCheckbox.checked)
        // console.log(dairyCheckbox.checked)
        // console.log(glutenCheckbox.checked)
        // console.log(vegetarianCheckbox.checked)

        let entryData = {
            foodInput: foodInput.value,
            foodCategory: foodCategory.value,
            foodQty: foodQty.value,
            pickupWindow: pickupWindow.value,
            handlingNotes: handlingNotes.value,
            hasNuts: nutsCheckbox.checked,
            hasDairy: dairyCheckbox.checked,
            hasGluten: glutenCheckbox.checked,
            isVegetarian: vegetarianCheckbox.checked,
        }

        console.log(entryData);

        // datbase.push(entryData)
    }