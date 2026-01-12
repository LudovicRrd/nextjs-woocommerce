import { useState } from 'react';
import { Product, ProductType } from '@/types/product';
import { getUniqueProductTypes } from '@/utils/functions/productUtils';


export const useProductFilters = (products: Product[]) => {
  const [sortBy, setSortBy] = useState('popular');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [productTypes, setProductTypes] = useState<ProductType[]>(() =>
    products ? getUniqueProductTypes(products) : [],
  );


  const toggleProductType = (id: string) => {
    setProductTypes((prev) =>
      prev.map((type) =>
        type.id === id ? { ...type, checked: !type.checked } : type,
      ),
    );
  };


  const resetFilters = () => {
    setSelectedSizes([]);
    setSelectedColors([]);
    setPriceRange([0, 1000]);
    setProductTypes((prev) =>
      prev.map((type) => ({ ...type, checked: false })),
    );
  };


  const filterProducts = (products: Product[]) => {
    const filtered = products?.filter((product: Product) => {
      // Filter by price
      // SAFE FIX 1: Check if price exists
      const safePriceString = product.price || '0'; 
      const productPrice = parseFloat(safePriceString.replace(/[^0-9.]/g, ''));
      
      const withinPriceRange =
        productPrice >= priceRange[0] && productPrice <= priceRange[1];


      if (!withinPriceRange) return false;


      // Filter by product type
      const selectedTypes = productTypes
        .filter((t) => t.checked)
        .map((t) => t.name.toLowerCase());
      if (selectedTypes.length > 0) {
        const productCategories =
          product.productCategories?.nodes.map((cat) =>
            cat.name.toLowerCase(),
          ) || [];
        if (!selectedTypes.some((type) => productCategories.includes(type)))
          return false;
      }


      // Filter by size
      if (selectedSizes.length > 0) {
        // Safe check for missing size nodes
        const productSizes =
          product.allPaSizes?.nodes?.map((node) => node.name) || [];
        if (!selectedSizes.some((size) => productSizes.includes(size)))
          return false;
      }


      // Filter by color
      if (selectedColors.length > 0) {
        // Safe check for missing color nodes
        const productColors =
          product.allPaColors?.nodes?.map((node) => node.name) || [];
        if (!selectedColors.some((color) => productColors.includes(color)))
          return false;
      }


      return true;
    });


    // Sort products
    return [...(filtered || [])].sort((a, b) => {
      // SAFE FIX 2: Check if price exists in sort logic too
      const safePriceA = a.price || '0';
      const safePriceB = b.price || '0';
      
      const priceA = parseFloat(safePriceA.replace(/[^0-9.]/g, ''));
      const priceB = parseFloat(safePriceB.replace(/[^0-9.]/g, ''));


      switch (sortBy) {
        case 'price-low':
          return priceA - priceB;
        case 'price-high':
          return priceB - priceA;
        case 'newest':
          return b.databaseId - a.databaseId;
        default: // 'popular'
          return 0;
      }
    });
  };


  return {
    sortBy,
    setSortBy,
    selectedSizes,
    setSelectedSizes,
    selectedColors,
    setSelectedColors,
    priceRange,
    setPriceRange,
    productTypes,
    toggleProductType,
    resetFilters,
    filterProducts,
  };
};